provider "azurerm" {
  storage_use_azuread = true

  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
    cognitive_account {
      purge_soft_delete_on_destroy = true
    }
    application_insights {
      disable_generated_rule = false
    }
  }
}

provider "azuread" {}