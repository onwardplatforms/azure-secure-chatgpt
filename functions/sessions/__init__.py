import logging
import azure.functions as func
from azure.cosmos import CosmosClient, PartitionKey
import os
import json

from utilities.core import create_cosmos_db_client, connect_to_cosmos_db_container, query_records_from_cosmos_db, update_record_in_cosmos_db, write_record_to_cosmos_db, delete_record_from_cosmos_db
from utilities.constants import OK, CREATED, NO_CONTENT, BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    # Collect required variables
    try:
        # TODO: Rename these later to COSMOS_ENDPOINT, COSMOS_PRIMARY_KEY, and COSMOS_DATABASE.
        endpoint = os.environ["COSMOSDB_URL"]
        primary_key = os.environ["COSMOSDB_KEY"]
        database_name = os.environ["COSMOSDB_DATABASE"]
        container_name = "sessions"
        session_id = req.route_params.get('session_id')
        user_id = req.route_params.get('user_id')
    except Exception as e:
        logging.error(f"Error reading environment variables or parameters: {str(e)}")
        return func.HttpResponse("Internal server error", status_code=INTERNAL_SERVER_ERROR)

    # Connect to the container
    try:
        client = create_cosmos_db_client(
            endpoint=endpoint,
            primary_key=primary_key
        )
        container = connect_to_cosmos_db_container(
            client=client,
            database=database_name,
            container=container_name
        )
    except Exception as e:
        logging.error(f"Error connecting to Cosmos DB: {str(e)}")
        return func.HttpResponse(
            "Internal server error",
            status_code=INTERNAL_SERVER_ERROR
        )

    if req.method == "GET":
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
                status_code=OK,
                headers={
                    "Content-Type": "application/json"
                }
            )

        except Exception as e:
            logging.error(f"Error querying Cosmos DB: {str(e)}")
            return func.HttpResponse("Internal server error", status_code=INTERNAL_SERVER_ERROR)
        
    if req.method == "POST":
        data = req.get_json()
        # if not data:
        #     return func.HttpResponse(
        #         json.dumps({"status": "error", "message": "Invalid data provided"}),
        #         status_code=BAD_REQUEST,
        #         headers={"Content-Type": "application/json"}
        #     )

        try:
            if session_id:
                # Update logic
                if 'userId' not in data:
                    data['userId'] = user_id
                if 'id' not in data:
                    data['id'] = session_id
                updated = update_record_in_cosmos_db(
                    container=container,
                    data=data,
                    id=session_id,
                    partition_key=user_id
                )
                if not updated:
                    return func.HttpResponse(
                        json.dumps({"status": "error", "message": "Record not found"}),
                        status_code=NOT_FOUND,
                        headers={"Content-Type": "application/json"}
                    )
                message = "Record updated successfully."
                status_code = OK
            else:
                # Create logic
                if 'userId' not in data:
                    data['userId'] = user_id
                write_record_to_cosmos_db(
                    container=container,
                    data=data
                )
                message = "Record created successfully."
                status_code = CREATED
            
            return func.HttpResponse(
                json.dumps({"status": "success", "message": message}),
                status_code=status_code,
                headers={"Content-Type": "application/json"}
            )

        except Exception as e:
            logging.error(f"Error with POST operation on Cosmos DB: {str(e)}")
            return func.HttpResponse(
                json.dumps({"status": "error", "message": "Internal server error"}),
                status_code=INTERNAL_SERVER_ERROR,
                headers={"Content-Type": "application/json"}
            )

    if req.method == "DELETE":
        try:
            if session_id:
                delete_record_from_cosmos_db(
                    container=container,
                    id=session_id,
                    partition_key=user_id
                )
            else:
                records = query_records_from_cosmos_db(container, query="SELECT * FROM c WHERE c.userId = @user_id", parameters=[{"name": "@user_id", "value": user_id}])
                for record in records:
                    delete_record_from_cosmos_db(
                        container=container,
                        id=record['id'],
                        partition_key=user_id
                    )
            
            return func.HttpResponse(
                "File(s) deleted successfully.",
                status_code=OK,
                headers={
                    "Content-Type": "application/json"
                }
            )

        except Exception as e:
            logging.error(f"Error deleting records from Cosmos DB: {str(e)}")
            return func.HttpResponse("Internal server error", status_code=INTERNAL_SERVER_ERROR)
