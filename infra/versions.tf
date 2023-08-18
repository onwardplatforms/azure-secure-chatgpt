terraform {
  required_version = ">= 1.3"
  backend "azurerm" {
    # This is set in local.backend files or through the -backend-config flag in GitHub Actions
    container_name="state"
    key="dev.terraform.tfstate"
    resource_group_name="terraform"
    storage_account_name="terraform5683"
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
    archive = {
      source  = "hashicorp/archive"
      version = ">= 2.0"
    }
  }
}