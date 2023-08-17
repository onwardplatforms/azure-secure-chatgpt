import logging
import azure.functions as func
from azure.cosmos import CosmosClient, PartitionKey
import os
import json

from utilities.core import create_cosmos_db_client, connect_to_cosmos_db_container, query_records_from_cosmos_db

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    if req.method == "GET":
        # Collect required variables
        try:
            cosmos_db_endpoint = os.environ["COSMOSDB_URL"]
            cosmos_db_primary_key = os.environ["COSMOSDB_KEY"]
            database_name = os.environ["COSMOSDB_DATABASE"]
            container_name = "sessions"
            session_id = req.route_params.get('session_id')
            user_id = req.route_params.get('user_id')
        except Exception as e:
            logging.error(f"Error reading environment variables or parameters: {str(e)}")
            return func.HttpResponse("Internal server error", status_code=500)

        # Connect to the container
        try:
            client = create_cosmos_db_client(cosmos_db_endpoint, cosmos_db_primary_key)
            container = connect_to_cosmos_db_container(client, database_name, container_name)
        except Exception as e:
            logging.error(f"Error connecting to Cosmos DB: {str(e)}")
            return func.HttpResponse("Internal server error", status_code=500)

        # Define the query based on parameters
        try:
            if session_id:
                query = "SELECT * FROM c WHERE c.userId = @user_id AND c.id = @session_id"
                parameters = [
                    {"name": "@user_id", "value": user_id},
                    {"name": "@session_id", "value": session_id}
                ]
            else:
                query = "SELECT * FROM c WHERE c.userId = @user_id"
                parameters = [{"name": "@user_id", "value": user_id}]
            
            records = container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True)
            
            return func.HttpResponse(
                json.dumps(list(records)),
                status_code=200,
                headers={
                    "Content-Type": "application/json"
                }
            )

        except Exception as e:
            logging.error(f"Error querying Cosmos DB: {str(e)}")
            return func.HttpResponse("Internal server error", status_code=500)
