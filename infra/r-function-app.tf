resource "azurerm_linux_function_app" "main" {
  name                = "func-${local.project_name}"
  resource_group_name = azurerm_resource_group.application.name
  location            = azurerm_resource_group.application.location

  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  service_plan_id            = azurerm_service_plan.main.id
  public_network_access_enabled = true # TODO: set this equal to the variable later

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true
    application_insights_connection_string = azurerm_application_insights.main.connection_string
    application_insights_key               = azurerm_application_insights.main.instrumentation_key
    application_stack {
      python_version = "3.9"
    }
  }

  app_settings = {
    COSMOSDB_URL           = azurerm_cosmosdb_account.main.endpoint
    COSMOSDB_KEY           = azurerm_cosmosdb_account.main.primary_key
    COSMOSDB_DATABASE      = azurerm_cosmosdb_sql_database.main.name
    SUBSCRIPTION_ID        = data.azurerm_client_config.current.subscription_id
    RESOURCE_GROUP_NAME    = azurerm_resource_group.application.name
    COGNITIVE_ACCOUNT_NAME = azurerm_cognitive_account.main.name
    # WEBSITE_RUN_FROM_PACKAGE = azurerm_storage_blob.function_app_code.url
  }

  lifecycle {
    ignore_changes = [
      # Ignore changes to virtual_network_subnet_id which is set with the swift connection
      virtual_network_subnet_id,
    ]
  }

  tags = merge(
    var.tags,
    {
      "hidden-link: /app-insights-instrumentaiton-key" = azurerm_application_insights.main.instrumentation_key
      "hidden-link: /app-insights-connection-string"   = azurerm_application_insights.main.connection_string
    }
  )
}

resource "azurerm_role_assignment" "cosmos_contributor" {
  scope                = azurerm_cosmosdb_account.main.id
  role_definition_name = "DocumentDB Account Contributor"
  principal_id         = azurerm_linux_function_app.main.identity[0].principal_id
}

resource "azurerm_role_assignment" "storage_blob_data_contibutor" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "DocumentDB Account Contributor"
  principal_id         = azurerm_linux_function_app.main.identity[0].principal_id
}

resource "azurerm_role_assignment" "cognitive_services_contributor" {
  scope                = azurerm_cognitive_account.main.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_linux_function_app.main.identity[0].principal_id
}

# data "archive_file" "function_app_code" {
#   type        = "zip"
#   source_dir  = "${path.module}/../functions"
#   output_path = "${path.module}/function-code.zip"
# }

# resource "azurerm_storage_blob" "function_app_code" {
#   name                   = "function-code.zip"
#   storage_account_name   = azurerm_storage_account.main.name
#   storage_container_name = azurerm_storage_container.function_releases.name
#   type                   = "Block"
#   source                 = data.archive_file.function_app_code.output_path
#   content_md5            = data.archive_file.function_app_code.output_md5
# }

# Provide connectivity from the virtual network to the web app
resource "azurerm_private_endpoint" "function_app" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "pep-func-${local.project_name}"
  location            = azurerm_resource_group.networking[0].location
  resource_group_name = azurerm_resource_group.networking[0].name
  subnet_id           = azurerm_subnet.private_endpoints[count.index].id

  private_service_connection {
    name                           = "psc-func-${local.project_name}"
    private_connection_resource_id = azurerm_linux_function_app.main.id
    subresource_names              = ["sites"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_a_record" "function_app" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = azurerm_linux_function_app.main.name
  zone_name           = azurerm_private_dns_zone.app[count.index].name
  resource_group_name = azurerm_resource_group.networking[0].name
  ttl                 = 300
  records             = [azurerm_private_endpoint.function_app[count.index].private_service_connection[0].private_ip_address]
}

# Provide connectivity from the web app to the virtual network
resource "azurerm_app_service_virtual_network_swift_connection" "function_app" {
  count = var.public_network_access_enabled ? 0 : 1

  app_service_id = azurerm_linux_function_app.main.id
  subnet_id      = azurerm_subnet.app_services[count.index].id
}