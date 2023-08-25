resource "azurerm_linux_web_app_slot" "qa" {
  name            = "qa"
  app_service_id  = azurerm_linux_web_app.main.id
  service_plan_id = azurerm_service_plan.main.id

  https_only = true
  # Turn off public network access if the user decides to deploy to a virtual network
  public_network_access_enabled = var.app_public_network_access_enabled ? true : var.public_network_access_enabled

  identity {
    type = "SystemAssigned"
  }

  app_settings = merge(
    # App settings provided by users
    var.app_settings,
    # Default app settings
    local.app_settings_defaults,
  )

  site_config {
    http2_enabled       = true
    minimum_tls_version = 1.2
    # app_command_line    = "node standalone/server.js"

    application_stack {
      node_version = "18-lts"
    }
  }

  lifecycle {
    ignore_changes = [
      # This is currently required due top an issue in the azurerm provider
      service_plan_id,
      # Ignore changes to virtual_network_subnet_id which is set with the swift connection
      virtual_network_subnet_id,
    ]
  }
}

# Provide connectivity from the virtual network to the web app slot
resource "azurerm_private_endpoint" "web_app_slot_qa" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "pep-app-qa-${local.project_name}"
  location            = azurerm_resource_group.networking[0].location
  resource_group_name = azurerm_resource_group.networking[0].name
  subnet_id           = azurerm_subnet.private_endpoints[count.index].id

  private_service_connection {
    name                           = "psc-app-qa-${local.project_name}"
    private_connection_resource_id = azurerm_linux_web_app.main.id
    subresource_names              = ["sites-qa"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_a_record" "web_app_slot_qa" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "${azurerm_linux_web_app_slot.qa.name}.${azurerm_linux_web_app.main.name}"
  zone_name           = azurerm_private_dns_zone.app[count.index].name
  resource_group_name = azurerm_resource_group.networking[0].name
  ttl                 = 300
  records             = [azurerm_private_endpoint.web_app_slot_qa[count.index].private_service_connection[0].private_ip_address]
}

resource "azurerm_private_dns_a_record" "web_app_slot_qa_scm" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "${azurerm_linux_web_app_slot.qa.name}.${azurerm_linux_web_app.main.name}"
  zone_name           = azurerm_private_dns_zone.app_scm[count.index].name
  resource_group_name = azurerm_resource_group.networking[0].name
  ttl                 = 300
  records             = [azurerm_private_endpoint.web_app[count.index].private_service_connection[0].private_ip_address]
}

# Provide connectivity from the web app to the virtual network
resource "azurerm_app_service_slot_virtual_network_swift_connection" "web_app_slot_qa" {
  count = var.public_network_access_enabled ? 0 : 1

  app_service_id = azurerm_linux_web_app.main.id
  slot_name      = azurerm_linux_web_app_slot.qa.name
  subnet_id      = azurerm_subnet.app_services[count.index].id
}
