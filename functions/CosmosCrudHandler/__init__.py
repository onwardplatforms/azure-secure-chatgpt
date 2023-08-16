import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

# Retrieve the Cosmos DB connection details from environment variables
url = os.environ['COSMOSDB_URL']
key = os.environ['COSMOSDB_KEY']
database = os.environ['COSMOSDB_DATABASE']
client = CosmosClient(url, credential=key)
database = client.get_database_client(database)

def main(req: func.HttpRequest) -> func.HttpResponse:
    action = req.params.get('action')
    container = req.params.get('container')
    container = database.get_container_client(container)
    logging.info(f"Received action: {action}")

    if action == 'create':
        item = req.get_json()
        partition_key_value = req.headers.get('x-ms-documentdb-partitionkey')
        if not partition_key_value:
            return func.HttpResponse("Partition key header is missing", status_code=400)

        try:
            partition_key_value = json.loads(partition_key_value)
        except json.JSONDecodeError:
            return func.HttpResponse("Invalid partition key header format", status_code=400)

        created_item = container.create_item(body=item)
        return func.HttpResponse(json.dumps(created_item), status_code=201, mimetype="application/json")
    
    elif action == 'read':
        item_id = req.params.get('id')
        partition_key_value = req.headers.get('x-ms-documentdb-partitionkey')
        if not partition_key_value:
            return func.HttpResponse("Partition key header is missing", status_code=400)

        try:
            partition_key_value = json.loads(partition_key_value)
        except json.JSONDecodeError:
            return func.HttpResponse("Invalid partition key header format", status_code=400)
            
        item = container.read_item(item=item_id, partition_key=partition_key_value[0])
        return func.HttpResponse(json.dumps(item), status_code=200, mimetype="application/json")

    elif action == 'update':
        item = req.get_json()
        partition_key_value = req.headers.get('x-ms-documentdb-partitionkey')
        if not partition_key_value:
            return func.HttpResponse("Partition key header is missing", status_code=400)
            
        try:
            partition_key_value = json.loads(partition_key_value)
        except json.JSONDecodeError:
            return func.HttpResponse("Invalid partition key header format", status_code=400)
            
        updated_item = container.upsert_item(body=item)
        return func.HttpResponse(json.dumps(updated_item), status_code=200, mimetype="application/json")

    elif action == 'delete':
        item_id = req.params.get('id')
        partition_key_value = req.headers.get('x-ms-documentdb-partitionkey')
        if not partition_key_value:
            return func.HttpResponse("Partition key header is missing", status_code=400)
            
        try:
            partition_key_value = json.loads(partition_key_value)
        except json.JSONDecodeError:
            return func.HttpResponse("Invalid partition key header format", status_code=400)
            
        container.delete_item(item=item_id, partition_key=partition_key_value[0])
        return func.HttpResponse("Item deleted", status_code=204)

    else:
        return func.HttpResponse("Action not supported", status_code=400)
