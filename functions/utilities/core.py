import azure.cosmos.cosmos_client as cosmos_client
# import azure.cosmos.errors as errors
# import azure.cosmos.documents as documents
# import azure.cosmos.http_constants as http_constants
from azure.cosmos.partition_key import PartitionKey
import azure.cosmos.exceptions as exceptions
import json

def create_cosmos_db_client(endpoint, primary_key):
    try:
        return cosmos_client.CosmosClient(endpoint, {'masterKey': primary_key})
    except exceptions.CosmosHttpResponseError as e:
        print('\nThere was an error. {0}'.format(e.message))

def connect_to_cosmos_db_container(client, database, container, partition_key="/id"):
    try:
        db = client.create_database_if_not_exists(id=database)
        container = db.create_container_if_not_exists(id=container, partition_key=PartitionKey(path=partition_key))
        return container
    except exceptions.CosmosHttpResponseError as e:
        print('\nThere was an error. {0}'.format(e.message))

def write_record_to_cosmos_db(container, body):
    try:
        result = container.upsert_item(body=body)
        return result
    except exceptions.CosmosHttpResponseError as e:
        print('\nThere was an error. {0}'.format(e.message))

def read_records_from_cosmos_db(container):
    # add max number as a query parameter
    records = list(container.read_all_items())
    
    return records

def read_record_from_cosmos_db(container, doc_id, partition_key):
    try:
        return container.read_item(item=doc_id, partition_key=partition_key)
    except exceptions.CosmosHttpResponseError as e:
        print('\nThere was an error. {0}'.format(e.message))
        raise e

def query_records_from_cosmos_db(container, query):
    records = []
    for item in container.query_items(
        query=query,
        enable_cross_partition_query=True,
    ):
        records.append(json.dumps(item, indent=True))

    return records

def update_record_in_cosmos_db(container, data, doc_id, partition_key):
    try:
        item = container.read_item(item=doc_id, partition_key=partition_key)
        for key, value in data.items():
            item[key] = value

        container.upsert_item(item)

    except exceptions.CosmosHttpResponseError as e:
        print('\nThere was an error. {0}'.format(e.message))
