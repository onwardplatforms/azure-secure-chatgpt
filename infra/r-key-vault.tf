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

  enable_rbac_authorization     = true
  sku_name                      = "standard"
  public_network_access_enabled = var.public_network_access_enabled

  tags = var.tags
}

# Ensure the principal running Terraform has access to key vault secrets
resource "azurerm_role_assignment" "key_vault_secrets_officer_current" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = data.azurerm_role_definition.key_vault_secrets_officer.name
  principal_id         = data.azurerm_client_config.current.object_id
}

# Provide connectivity from the virtual network to the key vault
resource "azurerm_private_endpoint" "key_vault" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "pep-key-vault-${local.project_name}"
  location            = azurerm_resource_group.networking[0].location
  resource_group_name = azurerm_resource_group.networking[0].name
  subnet_id           = azurerm_subnet.private_endpoints[0].id

  private_service_connection {
    name                           = "psc-key-vault-${local.project_name}"
    private_connection_resource_id = azurerm_key_vault.main.id
    subresource_names              = ["vault"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_a_record" "key_vault" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = azurerm_key_vault.main.name
  zone_name           = azurerm_private_dns_zone.key_vault[count.index].name
  resource_group_name = azurerm_resource_group.networking[0].name
  ttl                 = 300
  records             = [azurerm_private_endpoint.key_vault[count.index].private_service_connection[0].private_ip_address]
}

