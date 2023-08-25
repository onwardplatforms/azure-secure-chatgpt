# Project variables
variable "name" {
  type        = string
  description = "The name which should be used for this project."
  default     = "private-chatgpt"
}

variable "short_name" {
  type        = string
  description = "The short name which should be used for this project."
  default     = "pgpt"

  validation {
    condition     = length(var.short_name) <= 4
    error_message = "The short_name must be less than or equal to 4 characters."
  }
}

variable "location" {
  type        = string
  description = "The Azure Region where the Resource Group should exist. Changing this forces a new Resource Group to be created."
  default     = "eastus"
}

variable "tags" {
  type        = map(string)
  description = "A mapping of tags to assign to the resource."
  default     = {}
}

variable "public_network_access_enabled" {
  type        = bool
  description = "Should public network access be enabled for the application. Defaults to true."
  default     = true
}

# Cosmos Database Variables

variable "cosmos_db_capabilities" {
  type        = list(string)
  description = "A list of CosmosDB capabilities to enable."
  default     = []

  validation {
    condition = alltrue([
      for capability in var.cosmos_db_capabilities :
      contains([
        "AllowSelfServeUpgradeToMongo36",
        "DisableRateLimitingResponses",
        "EnableAggregationPipeline",
        "EnableCassandra",
        "EnableGremlin",
        "EnableMongo",
        "EnableMongo16MBDocumentSupport",
        "EnableMongoRetryableWrites",
        "EnableMongoRoleBasedAccessControl",
        "EnablePartialUniqueIndex",
        "EnableServerless",
        "EnableTable",
        "EnableTtlOnCustomPath",
        "EnableUniqueCompoundNestedDocs",
        "MongoDBv3.4",
      "mongoEnableDocLevelTTL"], capability)
    ])

    error_message = "The cosmos_db_capabilities can only include the following values: AllowSelfServeUpgradeToMongo36, DisableRateLimitingResponses, EnableAggregationPipeline, EnableCassandra, EnableGremlin, EnableMongo, EnableMongo16MBDocumentSupport, EnableMongoRetryableWrites, EnableMongoRoleBasedAccessControl, EnablePartialUniqueIndex, EnableServerless, EnableTable, EnableTtlOnCustomPath, EnableUniqueCompoundNestedDocs, MongoDBv3.4 and mongoEnableDocLevelTTL."
  }
}

variable "cosmos_db_geo_locations" {
  description = "List of Azure regions for Cosmos DB geo-replication."
  type        = list(string)
  default     = ["eastus", "westus"]
}

variable "cosmos_db_throughput" {
  description = "The throughput of the Cosmos DB account."
  type        = number
  default     = 400
}

# Cognitive Account variables

variable "cognitive_account_sku" {
  description = "Specifies the SKU Name for this Cognitive Service Account"
  type        = string
  default     = "S0"

  validation {
    condition     = contains(["F0", "F1", "S0", "S", "S1", "S2", "S3", "S4", "S5", "S6", "P0", "P1", "P2", "E0", "DC0"], var.cognitive_account_sku)
    error_message = "The cognitive_account_sku must be one of the following: F0, F1, S0, S, S1, S2, S3, S4, S5, S6, P0, P1, P2, E0, DC0."
  }
}

# App service variables

variable "app_service_environment_enabled" {
  description = "Enable an isolated environment for the app service using ASE."
  type        = bool
  default     = false
}

variable "app_service_plan_sku" {
  description = "The SKU of the App Service Plan"
  type        = string
  default     = "P1v3"
  validation {
    condition = contains([
      "B1", "B2", "B3",
      "S1", "S2", "S3",
      "P1v2", "P2v2", "P3v2", "P1v3", "P2v3", "P3v3",
      "I1", "I2", "I3", "I1v2", "I2v2", "I3v2", "I4v2", "I5v2", "I6v2"
    ], var.app_service_plan_sku)
    error_message = "Invalid SKU. The SKU must be one of the valid Azure App Service Plan SKUs."
  }
}

variable "app_settings" {
  type        = map(string)
  description = "A mapping of app settings to assign to the app service."
  default     = {}
}

variable "app_ad_authentication_enabled" {
  type        = bool
  description = "Should Azure AD authentication be enabled for the web app."
  default     = false
}

variable "app_public_network_access_enabled" {
  type        = bool
  description = "Should public network access be enabled for the web app."
  default     = true
}

# Virtual Machine
variable "deploy_virtual_machine" {
  type        = bool
  description = "Should a virtual machine be deployed to the resource group."
  default     = false
}

variable "enable_automatic_vm_shutdown" {
  type        = bool
  description = "Should the virtual machine be automatically shutdown at a specific time."
  default     = true
}
