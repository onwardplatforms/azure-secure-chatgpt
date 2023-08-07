# Deploys a cognitive services account for OpenAI
resource "azurerm_cognitive_account" "main" {
  name                  = "oai-${local.project_name}"
  location              = azurerm_resource_group.application.location
  resource_group_name   = azurerm_resource_group.application.name
  kind                  = "OpenAI"
  custom_subdomain_name = local.project_name

  sku_name = var.cognitive_account_sku

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

# Provide connectivity from the virtual network to the cognitive services account
resource "azurerm_private_endpoint" "openai" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = "pep-openai-${local.project_name}"
  location            = azurerm_resource_group.networking.location
  resource_group_name = azurerm_resource_group.networking.name
  subnet_id           = azurerm_subnet.private_endpoints[0].id

  private_service_connection {
    name                           = "psc-openai-${local.project_name}"
    private_connection_resource_id = azurerm_cognitive_account.main.id
    subresource_names              = ["account"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_zone" "openai" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = "privatelink.openai.azure.com"
  resource_group_name = azurerm_resource_group.networking.name
}

resource "azurerm_private_dns_a_record" "openai" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = azurerm_cognitive_account.main.name
  zone_name           = azurerm_private_dns_zone.openai[count.index].name
  resource_group_name = azurerm_resource_group.networking.name
  ttl                 = 300
  records             = [azurerm_private_endpoint.openai[count.index].private_service_connection[0].private_ip_address]
}

resource "azurerm_private_dns_zone_virtual_network_link" "openai" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                  = "${azurerm_virtual_network.main[count.index].name}-link-to-${replace(azurerm_private_dns_zone.openai[count.index].name, ".", "-")}"
  resource_group_name   = azurerm_resource_group.networking.name
  private_dns_zone_name = azurerm_private_dns_zone.openai[count.index].name
  virtual_network_id    = azurerm_virtual_network.main[count.index].id
}
