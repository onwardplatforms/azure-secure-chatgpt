resource "azurerm_storage_account" "main" {
  name                          = "st${replace(local.project_name, "-", "")}"
  resource_group_name           = azurerm_resource_group.application.name
  location                      = azurerm_resource_group.application.location
  account_tier                  = "Standard"
  account_replication_type      = "LRS"
  enable_https_traffic_only     = true
  public_network_access_enabled = true # TODO: set this equal to the variable later

  tags = var.tags
}

resource "azurerm_storage_container" "app_builds" {
  name                  = "app-builds"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "function_releases" {
  name                  = "function-releases"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}
