resource "azurerm_network_security_group" "main" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = "nsg-${local.project_name}"
  location            = azurerm_resource_group.networking.location
  resource_group_name = azurerm_resource_group.networking.name
}

resource "azurerm_virtual_network" "main" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                = "vnet-${local.project_name}"
  location            = azurerm_resource_group.networking.location
  resource_group_name = azurerm_resource_group.networking.name
  address_space       = ["10.0.0.0/16"]
  dns_servers         = ["10.0.0.4", "10.0.0.5"]

  tags = var.tags
}

resource "azurerm_subnet" "private_endpoints" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                 = "snet-${local.project_name}-private-endpoints"
  resource_group_name  = azurerm_resource_group.networking.name
  virtual_network_name = azurerm_virtual_network.main[0].name
  address_prefixes     = ["10.0.1.0/24"]

  service_endpoints = [
    "Microsoft.AzureCosmosDB"
  ]
}

resource "azurerm_subnet" "app_services" {
  count = var.deploy_to_virtual_network ? 1 : 0

  name                 = "snet-${local.project_name}-app-services"
  resource_group_name  = azurerm_resource_group.networking.name
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
