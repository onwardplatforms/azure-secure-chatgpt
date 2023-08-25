locals {
  # TODO: Later do something like this for secrets @Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=${azurerm_key_vault_secret.cosmos_db_key.name}
  app_settings_defaults = {
    # This URI will be used to connect the application to key vault to get openai api keys
    "KEY_VAULT_URI" = azurerm_key_vault.main.vault_uri
    # "WEBSITE_RUN_FROM_PACKAGE" = azurerm_storage_blob.function_app_code.url
    # These settings are required to automatically connect app insights to the web app
    "AZURE_OPENAI_API_DEPLOYMENT_NAME"           = "gpt-35-turbo-16k"   # TODO: remove the need for this by just querying from the app using apis
    "AZURE_OPENAI_API_KEY"                       = "*****"              # TODO: add this back: azurerm_cognitive_account.main.primary_access_key
    "AZURE_OPENAI_API_VERSION"                   = "2023-03-15-preview" # TODO: make this an app configuration in the future
    "AZURE_OPENAI_API_INSTANCE_NAME"             = local.project_name
    "FUNCTION_APP_ENDPOINT"                      = "${azurerm_linux_function_app.main.default_hostname}/api"
    "FUNCTION_APP_KEY"                           = data.azurerm_function_app_host_keys.master.primary_key
    "AZURE_AD_CLIENT_ID"                         = data.azurerm_client_config.current.client_id
    "AZURE_AD_CLIENT_SECRET"                     = "*****" # TODO: Think about the best way to add this or if it is even needed
    "AZURE_AD_TENANT_ID"                         = data.azurerm_client_config.current.tenant_id
    "APPINSIGHTS_INSTRUMENTATIONKEY"             = azurerm_application_insights.main.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING"      = azurerm_application_insights.main.connection_string
    "APPINSIGHTS_PROFILERFEATURE_VERSION"        = "1.0.0"
    "APPINSIGHTS_SNAPSHOTFEATURE_VERSION"        = "1.0.0"
    "ApplicationInsightsAgent_EXTENSION_VERSION" = "~2"
    "DiagnosticServices_EXTENSION_VERSION"       = "~3"
    "MICROSOFT_PROVIDER_AUTHENTICATION_SECRET"   = azuread_application_password.app_auth.value
  }
}

data "azurerm_function_app_host_keys" "master" {
  name                = azurerm_linux_function_app.main.name
  resource_group_name = azurerm_linux_function_app.main.resource_group_name
  depends_on = [
    azurerm_linux_function_app.main
  ]
}

resource "azurerm_linux_web_app" "main" {
  name                = "app-${local.project_name}"
  resource_group_name = azurerm_resource_group.application.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id

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

  dynamic "auth_settings_v2" {
    for_each = var.app_ad_authentication_enabled ? ["enabled"] : []
    content {
      auth_enabled             = true
      default_provider         = "azureactivedirectory"
      excluded_paths           = []
      forward_proxy_convention = "NoProxy"
      http_route_api_prefix    = "/.auth"
      require_authentication   = true
      require_https            = true
      runtime_version          = "~1"
      unauthenticated_action   = "RedirectToLoginPage"

      active_directory_v2 {
        allowed_applications            = []
        allowed_audiences               = []
        allowed_groups                  = []
        allowed_identities              = []
        client_id                       = azuread_application.app_auth.application_id
        client_secret_setting_name      = "MICROSOFT_PROVIDER_AUTHENTICATION_SECRET"
        jwt_allowed_client_applications = []
        jwt_allowed_groups              = []
        login_parameters                = {}
        tenant_auth_endpoint            = "https://sts.windows.net/911aa7c9-864b-4b20-95c6-5c48178eda59/v2.0"
        www_authentication_disabled     = false
      }

      login {
        allowed_external_redirect_urls    = []
        cookie_expiration_convention      = "FixedTime"
        cookie_expiration_time            = "08:00:00"
        nonce_expiration_time             = "00:05:00"
        preserve_url_fragments_for_logins = false
        token_refresh_extension_time      = 72
        token_store_enabled               = true
        validate_nonce                    = true
      }
    }
  }

  sticky_settings {
    app_setting_names = [
      "MICROSOFT_PROVIDER_AUTHENTICATION_SECRET",
    ]
  }

  lifecycle {
    ignore_changes = [
      # Ignore changes to virtual_network_subnet_id which is set with the swift connection
      virtual_network_subnet_id,
    ]
  }

  tags = var.tags
}

# Provide connectivity from the virtual network to the web app
resource "azurerm_private_endpoint" "web_app" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "pep-app-${local.project_name}"
  location            = azurerm_resource_group.networking[0].location
  resource_group_name = azurerm_resource_group.networking[0].name
  subnet_id           = azurerm_subnet.private_endpoints[count.index].id

  private_service_connection {
    name                           = "psc-app-${local.project_name}"
    private_connection_resource_id = azurerm_linux_web_app.main.id
    subresource_names              = ["sites"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_a_record" "web_app" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = azurerm_linux_web_app.main.name
  zone_name           = azurerm_private_dns_zone.app[count.index].name
  resource_group_name = azurerm_resource_group.networking[0].name
  ttl                 = 300
  records             = [azurerm_private_endpoint.web_app[count.index].private_service_connection[0].private_ip_address]
}

resource "azurerm_private_dns_a_record" "web_app_scm" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = azurerm_linux_web_app.main.name
  zone_name           = azurerm_private_dns_zone.app_scm[count.index].name
  resource_group_name = azurerm_resource_group.networking[0].name
  ttl                 = 300
  records             = [azurerm_private_endpoint.web_app[count.index].private_service_connection[0].private_ip_address]
}

# Provide connectivity from the web app to the virtual network
resource "azurerm_app_service_virtual_network_swift_connection" "web_app" {
  count = var.public_network_access_enabled ? 0 : 1

  app_service_id = azurerm_linux_web_app.main.id
  subnet_id      = azurerm_subnet.app_services[count.index].id
}
