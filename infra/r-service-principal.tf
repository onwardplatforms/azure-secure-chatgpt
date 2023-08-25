data "azuread_client_config" "current" {}

resource "random_uuid" "enterprise_app_admin" {
}

resource "random_uuid" "enterprise_app_user" {
}

resource "azuread_application" "app_auth" {
  display_name     = local.project_name
  owners           = [data.azuread_client_config.current.object_id]
  sign_in_audience = "AzureADMyOrg"

  api {
    mapped_claims_enabled          = false
    requested_access_token_version = 2
  }

  app_role {
    id                   = random_uuid.enterprise_app_admin.result
    allowed_member_types = ["User"]
    description          = "Admins can manage roles and perform all task actions."
    display_name         = "Admin"
    enabled              = true
    value                = "admin"
  }

  app_role {
    id                   = random_uuid.enterprise_app_user.result
    allowed_member_types = ["User"]
    description          = "Users can perform basic tasks."
    display_name         = "User"
    enabled              = true
    value                = "user"
  }

  feature_tags {
    enterprise = false
    gallery    = false
  }

  required_resource_access {
    resource_app_id = "00000003-0000-0000-c000-000000000000"

    resource_access {
      id   = "e1fe6dd8-ba31-4d61-89e7-88639da4683d" # User.Read
      type = "Scope"
    }
  }

  web {
    #   + homepage_url  = "https://app.example.net"
    #   + logout_url    = "https://app.example.net/logout"
    redirect_uris = [
      "http://localhost:3000/api/auth/callback/azure-ad",
    ]

    implicit_grant {
      access_token_issuance_enabled = false
      id_token_issuance_enabled     = false
    }
  }
}

resource "azuread_service_principal" "app_auth" {
  application_id = azuread_application.app_auth.application_id
}

resource "azuread_application_password" "app_auth" {
  application_object_id = azuread_application.app_auth.object_id
}

resource "azurerm_key_vault_secret" "app_auth_client_id" {
  name         = "app-auth-client-id"
  value        = azuread_application.app_auth.id
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [
    azurerm_role_assignment.key_vault_secrets_officer_current
  ]
}

resource "azurerm_key_vault_secret" "app_auth_client_secret" {
  name         = "app-auth-client-secret"
  value        = azuread_application_password.app_auth.value
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [
    azurerm_role_assignment.key_vault_secrets_officer_current
  ]
}