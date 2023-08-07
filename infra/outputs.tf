output "openai_api_key" {
  value     = azurerm_cognitive_account.main.primary_access_key
  sensitive = true
}