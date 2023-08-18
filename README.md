# Azure Secure ChatGPT

## Overview

Add content here...

## Infrastructure Deployment

### Install Terraform

Before deploying the infrastructure, ensure that you have Terraform installed. The version of Terraform must be 1.3 or higher. Follow the installation guide provided by HashiCorp:

[Install Terraform CLI](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)

### Create State Management Infrastructure in Azure

For managing Terraform's state and plans, a specific Azure storage account and containers are required:

- Storage Account: This account will be used to store the Terraform state (tfstate) and plan (tfplan) files.
Containers:
- Terraform State container: A container within the storage account dedicated to the Terraform state file.
- Terraform Plan container: A container within the storage account to hold Terraform plan files.

### Create A Service Principal

To allow Terraform to interact with Azure resources, you need to create a Service Principal. This Service Principal should have both the Contributor and User Access Administrator roles.

Follow the guide below to set up the Service Principal:

[Authenticate Terraform to Azure](https://learn.microsoft.com/en-us/azure/developer/terraform/authenticate-to-azure?tabs=bash)

### Set Up GitHub Secrets

To deploy the infrastructure, specific GitHub secrets need to be set in your repository. Navigate to the 'Secrets' tab of your repository settings and add the following:

- AZURE_CREDENTIALS: JSON structured credentials of the Azure Service Principal. It should include clientId, clientSecret, subscriptionId, and tenantId.
- AZURE_WEB_APP_NAME: The name of your Azure Web App.
- TERRAFORM_RESOURCE_GROUP: The name of the Azure Resource Group where the Terraform resources will be deployed.
- TERRAFORM_STORAGE_ACCOUNT: The name of the Azure Storage Account used for storing Terraform's state and plan files.
- TFPLAN_CONTAINER: The name of the Azure Blob container where the Terraform plan files will be stored.
- TFSTATE_CONTAINER_NAME: The name of the Azure Blob container where the Terraform state file will be stored.
- TFSTATE_NAME: The name of the Terraform state file within the TFSTATE_CONTAINER_NAME container.

5. Start Deployment

Once all the pre-requisites are met, you can trigger the GitHub Actions workflow to deploy the infrastructure. This can be achieved by creating a pull request or manually through the GitHub Actions tab in your repository.