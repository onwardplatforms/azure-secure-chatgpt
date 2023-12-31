# Creates a cosmos database account
resource "azurerm_cosmosdb_account" "main" {
  name                = "cosmos-${local.project_name}"
  location            = azurerm_resource_group.application.location
  resource_group_name = azurerm_resource_group.application.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  enable_automatic_failover         = true
  local_authentication_disabled     = false
  is_virtual_network_filter_enabled = var.public_network_access_enabled ? false : true
  public_network_access_enabled     = var.public_network_access_enabled

  identity {
    type = "SystemAssigned"
  }

  dynamic "capabilities" {
    # Ensure serverless is enabled if desired
    for_each = var.cosmos_db_capabilities
    content {
      name = capabilities.value
    }
  }

  dynamic "virtual_network_rule" {
    for_each = var.public_network_access_enabled ? [] : ["enabled"]
    content {
      id = azurerm_subnet.private_endpoints[0].id
    }
  }

  consistency_policy {
    consistency_level       = "BoundedStaleness"
    max_interval_in_seconds = 300
    max_staleness_prefix    = 100000
  }

  dynamic "geo_location" {
    # Geo-locations are only valid if serverless is disabled
    for_each = [for location in var.cosmos_db_geo_locations : {
      location          = location
      failover_priority = index(var.cosmos_db_geo_locations, location)
    }]
    content {
      location          = geo_location.value.location
      failover_priority = geo_location.value.failover_priority
    }
  }

  tags = var.tags
}

resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "cosmos-sql-${local.project_name}"
  resource_group_name = azurerm_cosmosdb_account.main.resource_group_name
  account_name        = azurerm_cosmosdb_account.main.name
  throughput          = var.cosmos_db_throughput
}

resource "azurerm_cosmosdb_sql_container" "users" {
  name                  = "users"
  resource_group_name   = azurerm_cosmosdb_account.main.resource_group_name
  account_name          = azurerm_cosmosdb_account.main.name
  database_name         = azurerm_cosmosdb_sql_database.main.name
  partition_key_path    = "/id"
  partition_key_version = 1
  throughput            = var.cosmos_db_throughput

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    included_path {
      path = "/included/?"
    }

    excluded_path {
      path = "/excluded/?"
    }
  }
}

resource "azurerm_cosmosdb_sql_container" "sessions" {
  name                  = "sessions"
  resource_group_name   = azurerm_cosmosdb_account.main.resource_group_name
  account_name          = azurerm_cosmosdb_account.main.name
  database_name         = azurerm_cosmosdb_sql_database.main.name
  partition_key_path    = "/userId"
  partition_key_version = 1
  throughput            = var.cosmos_db_throughput

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    included_path {
      path = "/included/?"
    }

    excluded_path {
      path = "/excluded/?"
    }
  }
}

# Provide connectivity from the virtual network to the cosmos database account
resource "azurerm_private_endpoint" "cosmos_db" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "pep-cosmosdb-${local.project_name}"
  location            = azurerm_resource_group.networking[0].location
  resource_group_name = azurerm_resource_group.networking[0].name
  subnet_id           = azurerm_subnet.private_endpoints[0].id

  private_service_connection {
    name                           = "psc-cosmosdb-${local.project_name}"
    private_connection_resource_id = azurerm_cosmosdb_account.main.id
    subresource_names              = ["sql"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_a_record" "cosmos_db" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = azurerm_cosmosdb_account.main.name
  zone_name           = azurerm_private_dns_zone.cosmos_db[count.index].name
  resource_group_name = azurerm_resource_group.networking[0].name
  ttl                 = 300
  records             = [azurerm_private_endpoint.cosmos_db[count.index].private_service_connection[0].private_ip_address]
}

resource "azurerm_key_vault_secret" "cosmos_db_key" {
  name         = "cosmos-db-key"
  value        = azurerm_cosmosdb_account.main.primary_key
  key_vault_id = azurerm_key_vault.main.id

  # Ensure the role assignment is complete before trying to add the secret
  depends_on = [
    azurerm_role_assignment.key_vault_secrets_officer_current
  ]
}