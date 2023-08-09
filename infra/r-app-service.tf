locals {
  app_settings_defaults = {
    # This URI will be used to connect the application to key vault to get openai api keys
    "KEY_VAULT_URI" = azurerm_key_vault.main.vault_uri
    "AZURE_OPENAI_API_INSTANCE_NAME" = local.project_name
    "COSMOS_ENDPOINT" = azurerm_cosmosdb_account.main.endpoint
    # These settings are required to automatically connect app insights to the web app
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.main.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
    "APPINSIGHTS_PROFILERFEATURE_VERSION"             = "1.0.0"
    "APPINSIGHTS_SNAPSHOTFEATURE_VERSION"             = "1.0.0"
    "ApplicationInsightsAgent_EXTENSION_VERSION"      = "~2"
    "DiagnosticServices_EXTENSION_VERSION"            = "~3"
  }
}

# resource "azurerm_app_service_environment" "main" {
#   count = var.app_service_isolation_enabled == true ? 1 : 0

#   name                         = "ase-${local.project_name}"
#   resource_group_name          = azurerm_resource_group.main.name
#   subnet_id                    = azurerm_subnet.ase.id #TODO: Add this
#   pricing_tier                 = "I2"
#   front_end_scale_factor       = 10
#   internal_load_balancing_mode = "Web, Publishing"
#   allowed_user_ip_cidrs        = ["11.22.33.44/32", "55.66.77.0/24"]

#   cluster_setting {
#     name  = "DisableTls1.0"
#     value = "1"
#   }
# }

resource "azurerm_service_plan" "main" {
  name                = "asp-${local.project_name}"
  resource_group_name = azurerm_resource_group.application.name
  location            = azurerm_resource_group.application.location
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku

  tags = var.tags
}

resource "azurerm_linux_web_app" "main" {
  name                = "app-${local.project_name}"
  resource_group_name = azurerm_resource_group.application.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id

  https_only = true
  # Turn off public network access if the user decides to deploy to a virtual network
  public_network_access_enabled = var.deploy_to_virtual_network ? false : true

  app_settings = merge(
    # App settings provided by users
    var.app_settings,
    # Default app settings
    local.app_settings_defaults,
  )

  site_config {
    http2_enabled = true
    minimum_tls_version = 1.2
    app_command_line = "node server.js"

    application_stack {
      node_version = "18-lts"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    ignore_changes = [
      # Ignore changes to virtual_network_subnet_id which is set with the swift connection
      virtual_network_subnet_id,
    ]
  }

  tags = var.tags
}

resource "azurerm_application_insights" "main" {
  name                = "appi-${local.project_name}"
  location            = azurerm_resource_group.application.location
  resource_group_name = azurerm_resource_group.application.name
  application_type    = "web"

  tags = var.tags
}

# Grant the App Service's managed identity the Key Vault Secrets User built-in role at the Key Vault's scope
resource "azurerm_role_assignment" "linux_web_app_key_vault_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = data.azurerm_role_definition.key_vault_secrets_user.name
  principal_id         = azurerm_linux_web_app.main.identity[0].principal_id
}

# Provide connectivity from the virtual network to the web app
resource "azurerm_private_endpoint" "app" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = "pep-app-${local.project_name}"
  location            = azurerm_resource_group.networking.location
  resource_group_name = azurerm_resource_group.networking.name
  subnet_id           = azurerm_subnet.private_endpoints[count.index].id

  private_service_connection {
    name                           = "psc-app-${local.project_name}"
    private_connection_resource_id = azurerm_linux_web_app.main.id
    subresource_names              = ["sites"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_zone" "app" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = "privatelink.azurewebsites.net"
  resource_group_name = azurerm_resource_group.networking.name
}

resource "azurerm_private_dns_a_record" "app" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = azurerm_linux_web_app.main.name
  zone_name           = azurerm_private_dns_zone.app[count.index].name
  resource_group_name = azurerm_resource_group.networking.name
  ttl                 = 300
  records             = [azurerm_private_endpoint.app[count.index].private_service_connection[0].private_ip_address]
}

resource "azurerm_private_dns_zone_virtual_network_link" "app" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                  = "${azurerm_virtual_network.main[count.index].name}-link-to-${replace(azurerm_private_dns_zone.app[count.index].name, ".", "-")}"
  resource_group_name   = azurerm_resource_group.networking.name
  private_dns_zone_name = azurerm_private_dns_zone.app[count.index].name
  virtual_network_id    = azurerm_virtual_network.main[count.index].id
}

# Provide connectivity from the web app to the virtual network
resource "azurerm_app_service_virtual_network_swift_connection" "app" {
  count = var.deploy_to_virtual_network ? 1 : 0

  app_service_id = azurerm_linux_web_app.main.id
  subnet_id      = azurerm_subnet.app_services[count.index].id
}