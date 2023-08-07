resource "azurerm_storage_account" "main" {
  name                     = "st${replace(local.project_name, "-", "")}"
  resource_group_name      = azurerm_resource_group.application.name
  location                 = azurerm_resource_group.application.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  enable_https_traffic_only = true

  tags = var.tags
}

resource "azurerm_storage_container" "main" {
  name                  = "app-builds"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Provides the principal deploying the configuration permissions to
# read from and write to the storage container to deploy the build artifact
resource "azurerm_role_assignment" "storage_blob_data_contributor" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = data.azurerm_client_config.current.object_id
}