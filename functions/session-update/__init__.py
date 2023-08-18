import logging
import azure.functions as func
import os
import json

from utilities.core import create_cosmos_db_client, connect_to_cosmos_db_container
from utilities.constants import OK, BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info(
        "Python HTTP trigger function processed a request to update a session."
    )

    # Collect required variables
    try:
        endpoint = os.environ["COSMOSDB_URL"]
        primary_key = os.environ["COSMOSDB_KEY"]
        database_name = os.environ["COSMOSDB_DATABASE"]
        container_name = "sessions"
        user_id = req.route_params.get("user_id")
        session_id = req.route_params.get("session_id")
        session_data = req.get_json()
    except Exception as e:
        logging.error(
            f"Error reading environment variables, parameters or request body: {str(e)}"
        )
        return func.HttpResponse(
            "Internal server error", status_code=INTERNAL_SERVER_ERROR
        )

    # Validate session data (this can be extended based on your requirements)
    if not session_data:
        return func.HttpResponse("No session data provided.", status_code=BAD_REQUEST)

    # Add the session ID and user ID to the session data
    session_data["id"] = session_id
    session_data["userId"] = user_id

    # Connect to the container, fetch the existing session, and update it
    try:
        client = create_cosmos_db_client(endpoint=endpoint, primary_key=primary_key)
        container = connect_to_cosmos_db_container(
            client=client, database=database_name, container=container_name
        )

        # Fetching the existing session
        query = "SELECT * FROM c WHERE c.userId = @user_id AND c.id = @session_id"
        parameters = [
            {"name": "@user_id", "value": user_id},
            {"name": "@session_id", "value": session_id},
        ]
        results = list(
            container.query_items(
                query=query, parameters=parameters, enable_cross_partition_query=True
            )
        )

        if not results:
            return func.HttpResponse("Session not found.", status_code=NOT_FOUND)

        # Updating the session
        session_item = results[0]
        for key, value in session_data.items():
            session_item[key] = value

        updated_item = container.upsert_item(body=session_item)
        return func.HttpResponse(json.dumps(updated_item), status_code=OK)

    except Exception as e:
        logging.error(f"Error updating session in Cosmos DB: {str(e)}")
        return func.HttpResponse(
            "Internal server error", status_code=INTERNAL_SERVER_ERROR
        )
