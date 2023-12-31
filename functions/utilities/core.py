import azure.cosmos.cosmos_client as cosmos_client
# import azure.cosmos.errors as errors
# import azure.cosmos.documents as documents
# import azure.cosmos.http_constants as http_constants
from azure.cosmos.partition_key import PartitionKey
import azure.cosmos.exceptions as exceptions
import json
import datetime

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

def write_record_to_cosmos_db(container, data):
    try:
        record = container.upsert_item(body=data)
        return record
    except exceptions.CosmosHttpResponseError as e:
        print('\nThere was an error. {0}'.format(e.message))

def read_records_from_cosmos_db(container):
    # add max number as a query parameter
    records = list(container.read_all_items())
    
    return records

def delete_record_from_cosmos_db(container, id, partition_key):
    container.delete_item(id, partition_key)

def read_record_from_cosmos_db(container, id, partition_key):
    try:
        return container.read_item(item=id, partition_key=partition_key)
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

    return [json.loads(record) for record in records]

def update_record_in_cosmos_db(container, data, id, partition_key):
    try:
        record = container.read_item(item=id, partition_key=partition_key)
        for key, value in data.items():
            record[key] = value

        record = container.replace_item(id, record)
    
    except exceptions.CosmosHttpResponseError as e:
        print('\nThere was an error. {0}'.format(e.message))

    return record

def convert_to_dict(obj):
    if isinstance(obj, list):
        return [convert_to_dict(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_to_dict(value) for key, value in obj.items()}
    elif isinstance(obj, datetime.datetime):
        return obj.strftime("%Y-%m-%dT%H:%M:%S.%f%z")
    elif hasattr(obj, "__dict__"):
        return {
            key: convert_to_dict(value)
            for key, value in obj.__dict__.items()
            if not key.startswith("_")
        }
    else:
        return obj