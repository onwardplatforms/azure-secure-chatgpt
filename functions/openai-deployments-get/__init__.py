import logging
import azure.functions as func
import os
import json
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient
from azure.identity import DefaultAzureCredential

from utilities.constants import (
    OK,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR,
)


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Python HTTP trigger function processed a request to get a session.")

    # Collect required variables
    try:
        subscription_id = os.getenv('SUBSCRIPTION_ID')
        resource_group_name = os.getenv('RESOURCE_GROUP_NAME')
        account_name = os.getenv('COGNITIVE_ACCOUNT_NAME')
    except Exception as e:
        logging.error(f"Error reading environment variables or parameters: {str(e)}")
        return func.HttpResponse(
            "Internal server error", status_code=INTERNAL_SERVER_ERROR
        )

    # Connect to the container and fetch the session
    try:
        credential = DefaultAzureCredential()
        client = CognitiveServicesManagementClient(
            credential=credential,
            subscription_id=subscription_id
        )
    except Exception as e:
        logging.error(f"Error establishing connection to the Cognitive Services Account: {str(e)}")
        return func.HttpResponse(
            "Internal server error", status_code=INTERNAL_SERVER_ERROR
        )
    
    try:
        response = client.deployments.list(
            resource_group_name=resource_group_name,
            account_name=account_name,
        )
        deployments = [deployment.as_dict() for deployment in response]

        if not deployments:
            return func.HttpResponse("Model deployments not found", status_code=NOT_FOUND)
    
        return func.HttpResponse(json.dumps(list(deployments)), status_code=OK)
    
    except Exception as e:
        logging.error(f"Error fetching model deployments from the Cognitive Services account: {str(e)}")
        return func.HttpResponse(
            "Internal server error", status_code=INTERNAL_SERVER_ERROR
        )
