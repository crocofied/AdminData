# =========================== IMPORTS ===========================
from fastapi import APIRouter, Request, HTTPException
from github import Github
from github.GithubException import RateLimitExceededException
import bcrypt
import time
from ..dependencies import connect_database, validate_session

router = APIRouter() # Create a router

# Global variables to store the last check time and result
last_check_time = 0
last_check_result = None
RATE_LIMIT_COOLDOWN = 3600  # 1 hour in seconds

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


@router.post("/update_check", tags=["setup"])
async def update_check(request: Request):
    global last_check_time, last_check_result
    current_version = "v0.0.2-ALPHA"
    current_time = time.time()

    # Check if we're still in the rate limit cooldown period
    if current_time - last_check_time < RATE_LIMIT_COOLDOWN:
        # If we are, return the last known result or a default message
        return last_check_result or {"message": "Update check temporarily unavailable"}

    g = Github()
    try:
        repo = g.get_repo("crocofied/AdminData")
        latest = repo.get_latest_release().title
        
        # Update the last check time and result
        last_check_time = current_time
        if current_version != latest:
            last_check_result = {"message": "Update available", "latest": latest}
        else:
            last_check_result = {"message": "No update available", "latest": latest}
        
        return last_check_result

    except RateLimitExceededException:
        # Update the last check time and set a rate limit exceeded message
        last_check_time = current_time
        last_check_result = {"message": "Rate limit exceeded, try again later"}
        return last_check_result

    except Exception as e:
        # For any other exception, log it and return a generic error message
        print(f"Error checking for updates: {str(e)}")
        return {"message": "Error checking for updates"}