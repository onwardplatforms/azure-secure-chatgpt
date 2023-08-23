# Azure Secure OpenAI Development Framework

🚀 Creating secure OpenAI-based applications in Microsoft Azure. 🧙🏻‍♂️

## What is it?

Generative AI opens up tremendous opportunities for organizations to build new experiences that are highly differnentiated and delight their customers.  Many of the concerns around using these models, in particular for enterprises, are around the ability to ensure their implementation is secure and that their data and the data of their customers remains private.

The Azure Secure OpenAI Development Framework aims to help those looking to build applications with large language models on Microsoft Azure by providing a set of architecture, infrastructure code, utilities, and application(s) that enable rapid deployment and testing of these capabilities.

## Why are we doing this?

We recognized a gap in the open-source community: while many projects leverage OpenAI's foundational models, there's a scarcity of practical, configurable, and security-centric blueprints for organizations. This repository aims to bridge that gap, offering a starting point for those eager to build their own applications using OpenAI models on Azure.

## How is this secure?

All the services in this repository are deployed into a virtual network, backed by private endpoints, and resolved over private DNS when Terraform is deployed with the setting `public_network_access_enabled = false`.  This helps to ensure that all network traffic stays inside of your own internal virtual network and communication happens over the Microsoft Azure backbone.

Below is a high-level architecture diagram:

![architecture-diagram](./assets/Azure%20OpenAI%20App%20Architecture.jpg)

All applications developed as part of this framework will also implement Azure AD authentication to ensure only authenticated users can access them.

Furthermore, because applications built on this architecture use Azure's OpenAI API's, you get additional assurances about the use of your data from Microsoft including the following:

- Your prompts (inputs), completions (outputs), embeddings, and training data:

  - Are NOT accessible to other customers.
  - Are NOT accessible to OpenAI.
  - Are NOT used to improve OpenAI models.
  - Are NOT used to enhance any Microsoft or third-party products or services.
  - Are NOT utilized for automatically upgrading Azure OpenAI models (models remain stateless unless explicitly fine-tuned with your data).
- Your fine-tuned Azure OpenAI models are strictly reserved for your use.

The Azure OpenAI Service is entirely managed by Microsoft, hosted within the Azure environment, and does NOT interact with any OpenAI-operated services.

For more information, see the official documentation on [data, privacy, and security for Azure OpenAI Service](https://learn.microsoft.com/en-us/legal/cognitive-services/openai/data-privacy).

## What do I need to get started?

To utilize this repository, you will need to ensure that:

1. The OpenAI service is enabled for your Azure subscription.  If it is not, you can apply for access [here](https://go.microsoft.com/fwlink/?linkid=2222006&clcid=0x409&culture=en-us&country=us).
2. You have a service principal with the necessary permissions for resource management and RBAC assignment.  If you don't already have one, learn more about how to [authenticate Terraform to Azure](https://learn.microsoft.com/en-us/azure/developer/terraform/authenticate-to-azure?tabs=bash).

## How can I help?

We believe in the collective power of the community. If you have insights, bug fixes, feature suggestions, or any form of contribution, kindly raise pull requests against this repo. Every piece of feedback and contribution is invaluable.

## Whats next?

There are several planned improvements across the board.  Some ideas about ways to get started with contributing to this repo are:

- 📜 Creation of more comprehensive repository documentation
- 🧨 Improvements to deployment pipelines (which use GitHub Actions)
- 🛠️ Enhancements to the configurability or security of the infrastructure code (written in Terraform)
- 🦟 New features or bug fixes to any existing template applications
- 🌈 Anything else you can dream up!