## =========================== IMPORTS ===========================
from fastapi import Request, HTTPException
from dotenv import load_dotenv
import os
import mysql.connector
import sqlite3

load_dotenv()

# Define a dependency to check if the request has a valid token
def token_required(request: Request):
    token = request.headers.get('Authorization')
    if not token or token != f"Bearer {os.getenv('VITE_API_KEY')}":
        raise HTTPException(status_code=401, detail="Unauthorized")

# Define a dependency to connect to the database   
def connect_database(database: bool = True):
    con = sqlite3.connect("/app/db/admin_data.db")
    cursor = con.cursor()
    return con, cursor