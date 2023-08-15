resource "azurerm_storage_account" "main" {
  name                     = "st${replace(local.project_name, "-", "")}"
  resource_group_name      = azurerm_resource_group.application.name
  location                 = azurerm_resource_group.application.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  enable_https_traffic_only = true

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

resource "azurerm_role_assignment" "app_builds_container_storage_blob_data_contributor" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_function_app.main.identity[0].principal_id
}
