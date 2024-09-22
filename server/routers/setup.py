# =========================== IMPORTS ===========================
from fastapi import APIRouter
from fastapi import  Request, Depends, HTTPException
import bcrypt
from ..dependencies import token_required, connect_database

router = APIRouter() # Create a router

# Define a route to initialize the database
@router.post("/database_init", tags=["setup"])
async def database_init(request: Request, token=Depends(token_required)):
    con, cursor = connect_database(database=False)
    cursor.execute("CREATE DATABASE IF NOT EXISTS admin_data CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
    con.commit()
    cursor.close()
    con.close()

    # Create a default password and generate its hash and salt
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw("admin".encode(), salt)

    con, cursor = connect_database()
    # Create the users and sessions tables
    cursor.execute("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), salt VARCHAR(255)) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
    cursor.execute("CREATE TABLE IF NOT EXISTS sessions (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, token VARCHAR(255)) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
    con.commit()
    # Check if admin user exists else create a default user
    cursor.execute("SELECT * FROM users WHERE username='admin'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (username, password, salt) VALUES (%s, %s, %s)", ("admin", hashed, salt))
        con.commit()
    # Create the databases table
    cursor.execute("CREATE TABLE IF NOT EXISTS `databases` (id INT AUTO_INCREMENT PRIMARY KEY, userid INT, name VARCHAR(255), type INT, host VARCHAR(255), port INT, user VARCHAR(255), password VARCHAR(255)) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
    con.commit()
    cursor.close()
    con.close()
    
    return {"message": "Database initialized"}