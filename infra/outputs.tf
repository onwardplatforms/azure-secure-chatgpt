output "web_app_name" {
  value = azurerm_linux_web_app.main.name
}

output "web_app_qa_slot_name" {
  value = azurerm_linux_web_app_slot.qa.name
}