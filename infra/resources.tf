locals {
  project_name = "${var.name}-${random_string.main.id}"
}

data "azurerm_client_config" "current" {}

# This resource generates a random string so that resources with
# a global scope (e.g. CosmosDB) can be deployed multiple times
# without name collisions.
resource "random_string" "main" {
  length  = 8
  special = false
  upper   = false
  numeric = false
}

# Creates a resource group for the app components
resource "azurerm_resource_group" "application" {
  name     = "rg-${local.project_name}-application"
  location = var.location

  tags = var.tags
}

# Creates a resource group for the networking components
resource "azurerm_resource_group" "networking" {
  name     = "rg-${local.project_name}-networking"
  location = var.location

  tags = var.tags
}