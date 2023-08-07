data "azurerm_role_definition" "key_vault_secrets_officer" {
  name = "Key Vault Secrets Officer"
}

data "azurerm_role_definition" "key_vault_secrets_user" {
  name = "Key Vault Secrets User"
}

resource "azurerm_key_vault" "main" {
  name                        = "kv${replace(local.project_name, "-", "")}"
  location                    = azurerm_resource_group.application.location
  resource_group_name         = azurerm_resource_group.application.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  enable_rbac_authorization = true
  sku_name                  = "standard"

  tags = var.tags
}

# # Ensure the principal running Terraform has access to key vault secrets
# resource "azurerm_role_assignment" "key_vault_secrets_officer_current" {
#   scope                = azurerm_key_vault.main.id
#   role_definition_name = data.azurerm_builtin_role_definition.key_vault_secrets_officer.name
#   principal_id         = data.azurerm_client_config.current.object_id
# }

# resource "azurerm_key_vault_secret" "openai_api_key" {
#   name         = "openai-api-key"
#   value        = azurerm_cognitive_account.main.primary_access_key
#   key_vault_id = azurerm_key_vault.main.id

#   # Ensure the role assignment is complete before trying to add the secret
#   depends_on = [
#     azurerm_role_assignment.key_vault_secrets_officer_current
#   ]
# }

# resource "azurerm_key_vault_secret" "cosmos_db_key" {
#   name         = "cosmos-db-key"
#   value        = azurerm_cosmosdb_account.main.primary_key
#   key_vault_id = azurerm_key_vault.main.id

#   # Ensure the role assignment is complete before trying to add the secret
#   depends_on = [
#     azurerm_role_assignment.key_vault_secrets_officer_current
#   ]
# }

# Provide connectivity from the virtual network to the key vault
resource "azurerm_private_endpoint" "key_vault" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = "pep-key-vault-${local.project_name}"
  location            = azurerm_resource_group.networking.location
  resource_group_name = azurerm_resource_group.networking.name
  subnet_id           = azurerm_subnet.private_endpoints[0].id

  private_service_connection {
    name                           = "psc-key-vault-${local.project_name}"
    private_connection_resource_id = azurerm_key_vault.main.id
    subresource_names              = ["vault"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_zone" "key_vault" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = "privatelink.vaultcore.azure.net"
  resource_group_name = azurerm_resource_group.networking.name
}

resource "azurerm_private_dns_a_record" "key_vault" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = azurerm_key_vault.main.name
  zone_name           = azurerm_private_dns_zone.key_vault[count.index].name
  resource_group_name = azurerm_resource_group.networking.name
  ttl                 = 300
  records             = [azurerm_private_endpoint.key_vault[count.index].private_service_connection[0].private_ip_address]
}

resource "azurerm_private_dns_zone_virtual_network_link" "key_vault" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                  = "${azurerm_virtual_network.main[count.index].name}-link-to-${replace(azurerm_private_dns_zone.key_vault[count.index].name, ".", "-")}"
  resource_group_name   = azurerm_resource_group.networking.name
  private_dns_zone_name = azurerm_private_dns_zone.key_vault[count.index].name
  virtual_network_id    = azurerm_virtual_network.main[count.index].id
}
