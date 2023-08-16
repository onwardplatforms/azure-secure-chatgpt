import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os

from utilities.core import *

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    try:
        cosmos_db_endpoint = os.environ["COSMOSDB_URL"]
        cosmos_db_primary_key = os.environ["COSMOSDB_KEY"]
        database_name = os.environ["COSMOSDB_DATABASE"]
        container_name = "sessions"
        user_id = req.route_params.get('user_id')
        session_id = req.route_params.get('session_id')

    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

    try:
        # Try to connect to the client and collect the data from the database
        client = create_cosmos_db_client(cosmos_db_endpoint, cosmos_db_primary_key)
        container = connect_to_cosmos_db_container(client, database_name, container_name)
        delete_record_from_cosmos_db(container, doc_id=session_id, partition_key=user_id)

    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

    return func.HttpResponse(
        f"Document with ID {session_id} deleted.",
        status_code=200
    )
