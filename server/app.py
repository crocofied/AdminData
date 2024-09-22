from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import mysql.connector
import bcrypt
import uvicorn
import base64, secrets

# Load environment variables
load_dotenv()

# Setup FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
database_host = os.getenv("VITE_HOST_IP")
database_port = 3001
database_user = "root"
database_password = os.getenv("MYSQL_ROOT_PASSWORD")

def token_required(request: Request):
    token = request.headers.get('Authorization')
    if not token or token != f"Bearer {os.getenv('VITE_API_KEY')}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    
@app.get("/")
async def root(request: Request, token=Depends(token_required)):
    return {"message": "AdminData API"}

@app.post("/database_init")
async def database_init(request: Request, token=Depends(token_required)):
    con = mysql.connector.connect(
        host=database_host,
        port=database_port,
        user=database_user,
        password=database_password,
        collation='utf8mb4_general_ci'
    )
    cursor = con.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS admin_data CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
    con.commit()
    cursor.close()
    con.close()

    # Create default password hash and salt
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw("admin".encode(), salt)

    con = mysql.connector.connect(
        host=database_host,
        port=database_port,
        user=database_user,
        password=database_password,
        database="admin_data",
        collation='utf8mb4_general_ci'
    )
    cursor = con.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), salt VARCHAR(255)) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
    con.commit()
    cursor.execute("CREATE TABLE IF NOT EXISTS sessions (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, token VARCHAR(255)) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
    con.commit()
    # Check if admin user exists else Create a default user
    cursor.execute("SELECT * FROM users WHERE username='admin'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (username, password, salt) VALUES (%s, %s, %s)", ("admin", hashed, salt))
        con.commit()
    cursor.execute("CREATE TABLE IF NOT EXISTS `databases` (id INT AUTO_INCREMENT PRIMARY KEY, userid INT, name VARCHAR(255), type INT, host VARCHAR(255), port INT, user VARCHAR(255), password VARCHAR(255)) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
    con.commit()
    cursor.close()
    con.close()
    
    return {"message": "Database initialized"}

@app.post("/login")
async def login(request: Request, token=Depends(token_required)):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    con = mysql.connector.connect(
        host=database_host,
        port=database_port,
        user=database_user,
        password=database_password,
        database="admin_data",
        collation='utf8mb4_general_ci'
    )
    cursor = con.cursor()
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    cursor.close()
    con.close()

    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not bcrypt.checkpw(password.encode(), user[2].encode()):
        raise HTTPException(status_code=401, detail="Unauthorized")
            
    session_id = secrets.token_hex(20)
    con = mysql.connector.connect(
        host=database_host,
        port=database_port,
        user=database_user,
        password=database_password,
        database="admin_data",
        collation='utf8mb4_general_ci'
    )
    cursor = con.cursor()
    cursor.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (user[0], session_id))
    con.commit()
    cursor.close()
    con.close()

    return {"session_id": session_id}


# if __name__ == "__main__":
#   uvicorn.run(app, host="localhost", port=5000)
