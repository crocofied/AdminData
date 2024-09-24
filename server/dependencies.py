## =========================== IMPORTS ===========================
from fastapi import Request, HTTPException
from dotenv import load_dotenv
import os
import mysql.connector
import sqlite3

load_dotenv()

async def validate_session(request: Request):
    data = await request.json()
    session_id = data.get("session_id")
    con = sqlite3.connect("/app/db/admin_data.db")
    cursor = con.cursor()
    cursor.execute("SELECT * FROM sessions WHERE token=?", (session_id,))
    session = cursor.fetchone()
    cursor.close()
    con.close()
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")

# Define a dependency to connect to the database   
def connect_database(database: bool = True):
    con = sqlite3.connect("/app/db/admin_data.db")
    cursor = con.cursor()
    return con, cursor