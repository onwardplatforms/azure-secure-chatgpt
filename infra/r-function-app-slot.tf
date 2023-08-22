resource "azurerm_linux_function_app_slot" "qa" {
  name                          = "qa"
  function_app_id               = azurerm_linux_function_app.main.id
  storage_account_name          = azurerm_storage_account.main.name
  service_plan_id               = azurerm_service_plan.main.id
  public_network_access_enabled = true # TODO: set this equal to the variable later

  site_config {
    always_on                              = true
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

# Provide connectivity from the virtual network to the function app slot
resource "azurerm_private_endpoint" "function_app_slot_qa" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "pep-func-qa-${local.project_name}"
  location            = azurerm_resource_group.networking[0].location
  resource_group_name = azurerm_resource_group.networking[0].name
  subnet_id           = azurerm_subnet.private_endpoints[count.index].id

  private_service_connection {
    name                           = "psc-func-qa-${local.project_name}"
    private_connection_resource_id = azurerm_linux_function_app.main.id
    subresource_names              = ["sites-qa"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_a_record" "function_app_slot_qa" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "${azurerm_linux_function_app_slot.qa.name}.${azurerm_linux_function_app.main.name}"
  zone_name           = azurerm_private_dns_zone.app[count.index].name
  resource_group_name = azurerm_resource_group.networking[0].name
  ttl                 = 300
  records             = [azurerm_private_endpoint.function_app_slot_qa[count.index].private_service_connection[0].private_ip_address]
}

# Provide connectivity from the function app slot to the virtual network
resource "azurerm_app_service_slot_virtual_network_swift_connection" "function_app_slot_qa" {
  count = var.public_network_access_enabled ? 0 : 1

  app_service_id = azurerm_linux_function_app.main.id
  slot_name      = azurerm_linux_function_app_slot.qa.name
  subnet_id      = azurerm_subnet.app_services[count.index].id
}
