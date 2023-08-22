/**
 * # App Service Plan
 *
 * This app service plan is used to support both the apps
 * function app and web app.
 *
 */

resource "azurerm_service_plan" "main" {
  name                = "asp-${local.project_name}"
  resource_group_name = azurerm_resource_group.application.name
  location            = azurerm_resource_group.application.location
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku

  tags = var.tags
}