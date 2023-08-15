resource "azurerm_service_plan" "main" {
  name                = "asp-${local.project_name}"
  resource_group_name = azurerm_resource_group.application.name
  location            = azurerm_resource_group.application.location
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku

  tags = var.tags
}