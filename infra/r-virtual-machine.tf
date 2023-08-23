resource "azurerm_public_ip" "main" {
  count = var.deploy_virtual_machine && var.public_network_access_enabled == false ? 1 : 0

  name                = "pip-${local.project_name}"
  resource_group_name = azurerm_resource_group.networking[0].name
  location            = azurerm_resource_group.networking[0].location
  allocation_method   = "Static"

  tags = var.tags
}

resource "azurerm_network_interface" "main" {
  count = var.deploy_virtual_machine && var.public_network_access_enabled == false ? 1 : 0

  name                = "nic-${local.project_name}"
  location            = azurerm_resource_group.networking[0].location
  resource_group_name = azurerm_resource_group.networking[0].name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.admin[0].id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.main[0].id
  }

  tags = var.tags
}

resource "azurerm_windows_virtual_machine" "main" {
  count = var.deploy_virtual_machine && var.public_network_access_enabled == false ? 1 : 0

  name                = "vmw${replace(local.project_name_short, "-", "")}"
  resource_group_name = azurerm_resource_group.application.name
  location            = azurerm_resource_group.application.location
  size                = "Standard_F2"
  admin_username      = "adminuser"
  admin_password      = "P@$$w0rd1234!"
  network_interface_ids = [
    azurerm_network_interface.main[0].id,
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2016-Datacenter"
    version   = "latest"
  }

  tags = var.tags
}