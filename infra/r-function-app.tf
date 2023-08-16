resource "azurerm_linux_function_app" "main" {
  name                = "func-${local.project_name}"
  resource_group_name = azurerm_resource_group.application.name
  location            = azurerm_resource_group.application.location

  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  service_plan_id            = azurerm_service_plan.main.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true
    application_stack {
        python_version = "3.9"
    }
  }

  app_settings = {
    COSMOSDB_URL      = azurerm_cosmosdb_account.main.endpoint
    COSMOSDB_KEY      = azurerm_cosmosdb_account.main.primary_key
    COSMOSDB_DATABASE = azurerm_cosmosdb_sql_database.main.name
    WEBSITE_RUN_FROM_PACKAGE = azurerm_storage_blob.function_app_code.url
    APPINSIGHTS_INSTRUMENTATIONKEY = azurerm_application_insights.main.instrumentation_key
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.main.connection_string
  }
}

resource "azurerm_role_assignment" "cosmos_contributor" {
    scope                = azurerm_cosmosdb_account.main.id
    role_definition_name = "DocumentDB Account Contributor"
    principal_id         = azurerm_linux_function_app.main.identity[0].principal_id
}

data "archive_file" "function_app_code_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../functions"
  output_path = "${path.module}/function-code.zip"
}

resource "azurerm_storage_blob" "function_app_code" {
  name                   = "function-code.zip"
  storage_account_name   = azurerm_storage_account.main.name
  storage_container_name = azurerm_storage_container.function_releases.name
  type                   = "Block"
  source                 = data.archive_file.function_app_code_zip.output_path
}