/**
 * # App Insights
 *
 * This application insights instance is used to monitor
 * for issues with both the web application and function
 * app used to interact with cosmos database.
 *
 */

resource "azurerm_application_insights" "main" {
  name                = "appi-${local.project_name}"
  location            = azurerm_resource_group.application.location
  resource_group_name = azurerm_resource_group.application.name
  application_type    = "web"

  tags = var.tags
}