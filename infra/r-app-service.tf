locals {
  app_settings_defaults = {
    # This URI will be used to connect the application to key vault to get openai api keys
    "KEY_VAULT_URI" = azurerm_key_vault.main.vault_uri
    # "WEBSITE_RUN_FROM_PACKAGE" = azurerm_storage_blob.function_app_code.url
    # These settings are required to automatically connect app insights to the web app
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.main.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
    "APPINSIGHTS_PROFILERFEATURE_VERSION"             = "1.0.0"
    "APPINSIGHTS_SNAPSHOTFEATURE_VERSION"             = "1.0.0"
    "ApplicationInsightsAgent_EXTENSION_VERSION"      = "~2"
    "DiagnosticServices_EXTENSION_VERSION"            = "~3"
  }
}

resource "azurerm_linux_web_app" "main" {
  name                = "app-${local.project_name}"
  resource_group_name = azurerm_resource_group.application.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id

  https_only = true
  # Turn off public network access if the user decides to deploy to a virtual network
  public_network_access_enabled = var.public_network_access_enabled

  app_settings = merge(
    # App settings provided by users
    var.app_settings,
    # Default app settings
    local.app_settings_defaults,
  )

  site_config {
    http2_enabled = true
    minimum_tls_version = 1.2

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

# # Grant the App Service's managed identity the Key Vault Secrets User built-in role at the Key Vault's scope
# resource "azurerm_role_assignment" "linux_web_app_key_vault_secrets_user" {
#   scope                = azurerm_key_vault.main.id
#   role_definition_name = data.azurerm_builtin_role_definition.key_vault_secrets_user.name
#   principal_id         = azurerm_app_service.main.identity[0].principal_id
# }

# Provide connectivity from the virtual network to the web app
resource "azurerm_private_endpoint" "app" {
  count = var.public_network_access_enabled ? 0 : 1

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
  count = var.public_network_access_enabled ? 0 : 1

  name                = "privatelink.azurewebsites.net"
  resource_group_name = azurerm_resource_group.networking.name
}

resource "azurerm_private_dns_a_record" "app" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = azurerm_linux_web_app.main.name
  zone_name           = azurerm_private_dns_zone.app[count.index].name
  resource_group_name = azurerm_resource_group.networking.name
  ttl                 = 300
  records             = [azurerm_private_endpoint.app[count.index].private_service_connection[0].private_ip_address]
}

resource "azurerm_private_dns_zone_virtual_network_link" "app" {
  count = var.public_network_access_enabled ? 0 : 1

  name                  = "${azurerm_virtual_network.main[count.index].name}-link-to-${replace(azurerm_private_dns_zone.app[count.index].name, ".", "-")}"
  resource_group_name   = azurerm_resource_group.networking.name
  private_dns_zone_name = azurerm_private_dns_zone.app[count.index].name
  virtual_network_id    = azurerm_virtual_network.main[count.index].id
}

# Provide connectivity from the web app to the virtual network
resource "azurerm_app_service_virtual_network_swift_connection" "app" {
  count = var.public_network_access_enabled ? 0 : 1

  app_service_id = azurerm_linux_web_app.main.id
  subnet_id      = azurerm_subnet.app_services[count.index].id
}