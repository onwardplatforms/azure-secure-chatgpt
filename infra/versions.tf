terraform {
  required_version = ">= 1.3"
  backend "azurerm" {
    # This is set in local.backend files or through the -backend-config flag in GitHub Actions
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.0"
    }
  }
}