/**
 * # App Service Plan
 *
 * This app service plan is used to support both the apps
 * function app and web app.
 *
 */

locals {
  is_serverless_and_public  = var.enable_serverless && var.public_network_access_enabled
  is_serverless_and_private = var.enable_serverless && !var.public_network_access_enabled

  sku_name = local.is_serverless_and_public ? "Y1" : local.is_serverless_and_private ? "EP1" : var.app_service_plan_sku
}

resource "azurerm_service_plan" "main" {
  name                = "asp-${local.project_name}"
  resource_group_name = azurerm_resource_group.application.name
  location            = azurerm_resource_group.application.location
  os_type             = "Linux"
  sku_name            = "P1v3" # local.sku_name

  tags = var.tags
}