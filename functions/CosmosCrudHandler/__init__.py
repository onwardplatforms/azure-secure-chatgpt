import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

# Retrieve the Cosmos DB connection details from environment variables
url = os.environ['COSMOSDB_URL']
key = os.environ['COSMOSDB_KEY']
database = os.environ['COSMOSDB_DATABASE']
container = os.environ['COSMOSDB_CONTAINER']
client = CosmosClient(url, credential=key)
database = client.get_database_client(database)
container = database.get_container_client(container)

def main(req: func.HttpRequest) -> func.HttpResponse:
    action = req.params.get('action')
    logging.info(f"Received action: {action}")

    if action == 'create':
        item = req.get_json()
        created_item = container.create_item(body=item)
        return func.HttpResponse(json.dumps(created_item), status_code=201, mimetype="application/json")
    elif action == 'read':
        item_id = req.params.get('id')
        partition_key = req.params.get('partitionKey')
        logging.info(f"Attempting to read item with id: {item_id} and partitionKey: {partition_key}")
        item = container.read_item(item=item_id, partition_key=partition_key)
        return func.HttpResponse(json.dumps(item), status_code=200, mimetype="application/json")
    elif action == 'update':
        item = req.get_json()
        updated_item = container.upsert_item(body=item)
        return func.HttpResponse(json.dumps(updated_item), status_code=200, mimetype="application/json")
    elif action == 'delete':
        item_id = req.params.get('id')
        partition_key = req.params.get('partitionKey')
        container.delete_item(item=item_id, partition_key=partition_key)
        return func.HttpResponse("Item deleted", status_code=204)
    else:
        return func.HttpResponse("Action not supported", status_code=400)
