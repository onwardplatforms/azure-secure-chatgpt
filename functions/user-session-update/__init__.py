import logging
import azure.functions as func
import os
import json

from utilities.core import *

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed an update request.')

    try:
        # Extract environment variables
        cosmos_db_endpoint = os.environ["COSMOSDB_URL"]
        cosmos_db_primary_key = os.environ["COSMOSDB_KEY"]
        database_name = os.environ["COSMOSDB_DATABASE"]
        container_name = "sessions"

        # Extract parameters from the request
        session_id = req.route_params.get('session_id')
        user_id = req.route_params.get('user_id')

        # Extract the body from the request, which should contain the fields to be updated
        data = req.get_json()

    except Exception as e:
        return func.HttpResponse(str(e), status_code=400)

    try:
        # Connect to the Cosmos DB client and get the container
        client = create_cosmos_db_client(cosmos_db_endpoint, cosmos_db_primary_key)
        container = connect_to_cosmos_db_container(client, database_name, container_name)
        record = update_record_in_cosmos_db(container, data, session_id, user_id)

    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

    return func.HttpResponse(
        record,
        status_code=200
    )
