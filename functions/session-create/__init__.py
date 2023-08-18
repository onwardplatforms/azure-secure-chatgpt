import logging
import azure.functions as func
import os
import json
import uuid

from utilities.core import create_cosmos_db_client, connect_to_cosmos_db_container
from utilities.constants import (
    CREATED,
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
)


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info(
        "Python HTTP trigger function processed a request to create a session."
    )

    # Collect required variables
    try:
        endpoint = os.environ["COSMOSDB_URL"]
        primary_key = os.environ["COSMOSDB_KEY"]
        database_name = os.environ["COSMOSDB_DATABASE"]
        container_name = "sessions"
        user_id = req.route_params.get("user_id")
        session_id = str(uuid.uuid4())
        session_data = req.get_json()
    except Exception as e:
        logging.error(f"Error reading environment variables or parameters: {str(e)}")
        return func.HttpResponse(
            "Internal server error", status_code=INTERNAL_SERVER_ERROR
        )

    # Validate session data (this can be extended based on your requirements)
    if not session_data:
        return func.HttpResponse("No session data provided.", status_code=BAD_REQUEST)

    # Add the session ID and user ID to the session data
    session_data["id"] = session_id
    session_data["userId"] = user_id

    # Connect to the container and create the session
    try:
        client = create_cosmos_db_client(endpoint=endpoint, primary_key=primary_key)
        container = connect_to_cosmos_db_container(
            client=client, database=database_name, container=container_name
        )
        created_item = container.create_item(body=session_data)
        return func.HttpResponse(json.dumps(created_item), status_code=CREATED)

    except Exception as e:
        logging.error(f"Error creating session in Cosmos DB: {str(e)}")
        return func.HttpResponse(
            "Internal server error", status_code=INTERNAL_SERVER_ERROR
        )
