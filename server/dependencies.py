## =========================== IMPORTS ===========================
from fastapi import Request, HTTPException
from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()

# Define a dependency to check if the request has a valid token
def token_required(request: Request):
    token = request.headers.get('Authorization')
    if not token or token != f"Bearer {os.getenv('VITE_API_KEY')}":
        raise HTTPException(status_code=401, detail="Unauthorized")

# Define a dependency to connect to the database   
def connect_database(database: bool = True):
    load_dotenv() # Load environment variables
    # Define database connection parameters
    database_host = os.getenv("VITE_HOST_IP")
    database_port = 3001
    database_user = "root"
    database_password = os.getenv("MYSQL_ROOT_PASSWORD")

    con = mysql.connector.connect(
        host=database_host,
        port=database_port,
        user=database_user,
        password=database_password,
        collation='utf8mb4_general_ci',
        database="admin_data" if database else None
    )
    cursor = con.cursor()
    return con, cursor