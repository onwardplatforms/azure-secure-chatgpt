# Deploys a cognitive services account for OpenAI
resource "azurerm_cognitive_account" "main" {
  name                  = "oai-${local.project_name}"
  location              = azurerm_resource_group.application.location
  resource_group_name   = azurerm_resource_group.application.name
  kind                  = "OpenAI"
  custom_subdomain_name = local.project_name

  sku_name                      = var.cognitive_account_sku
  public_network_access_enabled = true # TODO: set this equal to the variable later

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

# Provide connectivity from the virtual network to the cognitive services account
resource "azurerm_private_endpoint" "openai" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "pep-openai-${local.project_name}"
  location            = azurerm_resource_group.networking[0].location
  resource_group_name = azurerm_resource_group.networking[0].name
  subnet_id           = azurerm_subnet.private_endpoints[0].id

  private_service_connection {
    name                           = "psc-openai-${local.project_name}"
    private_connection_resource_id = azurerm_cognitive_account.main.id
    subresource_names              = ["account"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_a_record" "openai" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = azurerm_cognitive_account.main.name
  zone_name           = azurerm_private_dns_zone.openai[count.index].name
  resource_group_name = azurerm_resource_group.networking[0].name
  ttl                 = 300
  records             = [azurerm_private_endpoint.openai[count.index].private_service_connection[0].private_ip_address]
}
