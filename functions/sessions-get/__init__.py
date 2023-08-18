import logging
import azure.functions as func
import os
import json

from utilities.core import create_cosmos_db_client, connect_to_cosmos_db_container
from utilities.constants import OK, INTERNAL_SERVER_ERROR


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info(
        "Python HTTP trigger function processed a request to get all sessions for a user."
    )

    # Collect required variables
    try:
        endpoint = os.environ["COSMOSDB_URL"]
        primary_key = os.environ["COSMOSDB_KEY"]
        database_name = os.environ["COSMOSDB_DATABASE"]
        container_name = "sessions"
        user_id = req.route_params.get("user_id")
    except Exception as e:
        logging.error(f"Error reading environment variables or parameters: {str(e)}")
        return func.HttpResponse(
            "Internal server error", status_code=INTERNAL_SERVER_ERROR
        )

    # Connect to the container and fetch the sessions
    try:
        client = create_cosmos_db_client(endpoint=endpoint, primary_key=primary_key)
        container = connect_to_cosmos_db_container(
            client=client, database=database_name, container=container_name
        )
        query = "SELECT * FROM c WHERE c.userId = @user_id"
        parameters = [{"name": "@user_id", "value": user_id}]
        results = list(
            container.query_items(
                query=query, parameters=parameters, enable_cross_partition_query=True
            )
        )

        return func.HttpResponse(json.dumps(results), status_code=OK)

    except Exception as e:
        logging.error(f"Error fetching sessions from Cosmos DB: {str(e)}")
        return func.HttpResponse(
            "Internal server error", status_code=INTERNAL_SERVER_ERROR
        )
