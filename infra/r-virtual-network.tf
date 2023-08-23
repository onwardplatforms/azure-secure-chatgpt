resource "azurerm_network_security_group" "main" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "nsg-${local.project_name}"
  location            = azurerm_resource_group.networking[0].location
  resource_group_name = azurerm_resource_group.networking[0].name
}

resource "azurerm_virtual_network" "main" {
  count = var.public_network_access_enabled ? 0 : 1

  name                = "vnet-${local.project_name}"
  location            = azurerm_resource_group.networking[0].location
  resource_group_name = azurerm_resource_group.networking[0].name
  address_space       = ["10.0.0.0/16"]
  # Use Azure-provided DNS servers
  dns_servers         = []

  tags = var.tags
}

resource "azurerm_subnet" "private_endpoints" {
  count = var.public_network_access_enabled ? 0 : 1

  name                 = "snet-${local.project_name}-private-endpoints"
  resource_group_name  = azurerm_resource_group.networking[0].name
  virtual_network_name = azurerm_virtual_network.main[0].name
  address_prefixes     = ["10.0.1.0/24"]

  service_endpoints = [
    "Microsoft.AzureCosmosDB"
  ]
}

resource "azurerm_subnet" "app_services" {
  count = var.public_network_access_enabled ? 0 : 1

  name                 = "snet-${local.project_name}-app-services"
  resource_group_name  = azurerm_resource_group.networking[0].name
  virtual_network_name = azurerm_virtual_network.main[0].name
  address_prefixes     = ["10.0.2.0/24"]

  delegation {
    name = "app-services"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_subnet" "admin" {
  count = var.deploy_virtual_machine && var.public_network_access_enabled == false ? 1 : 0

  name                 = "snet-${local.project_name}-admin"
  resource_group_name  = azurerm_resource_group.networking[0].name
  virtual_network_name = azurerm_virtual_network.main[0].name
  address_prefixes     = ["10.0.3.0/24"]
}
