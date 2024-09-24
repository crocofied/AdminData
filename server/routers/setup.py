# =========================== IMPORTS ===========================
from fastapi import APIRouter
from fastapi import Request, Depends, HTTPException
import bcrypt
from ..dependencies import connect_database, validate_session

router = APIRouter() # Create a router


# Define a route to initialize the database
@router.post("/database_init", tags=["setup"])
async def database_init(request: Request):
    # Create a default password and generate its hash and salt
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw("admin".encode(), salt)

    con, cursor = connect_database()
    # Create the users and sessions tables
    cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, salt TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, token TEXT)")
    con.commit()
    cursor.execute("SELECT * FROM users WHERE username='admin'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (username, password, salt) VALUES (?, ?, ?)", ("admin", hashed, salt))
        con.commit()
    # Create the databases table
    cursor.execute("CREATE TABLE IF NOT EXISTS databases (id INTEGER PRIMARY KEY AUTOINCREMENT, userid INTEGER, name TEXT, type INTEGER, host TEXT, port INTEGER, user TEXT, password TEXT)")
    con.commit()
    cursor.close()
    con.close()
    
    return {"message": "Database initialized"}