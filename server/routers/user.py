# =========================== IMPORTS ===========================
from fastapi import APIRouter
from fastapi import  Request, Depends, HTTPException
import bcrypt
import secrets
from dependencies import token_required, connect_database

router = APIRouter() # Create a router


@router.post("/login")
async def login(request: Request, token=Depends(token_required)):
    # Fetch the username and password from the request body
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    # Get the user from the database
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()

    # Check if the user exists and if the password is correct
    if not user or not bcrypt.checkpw(password.encode(), user[2].encode()):
        cursor.close()
        con.close()
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Create a session id and store it in the database
    session_id = secrets.token_hex(20)
    cursor.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (user[0], session_id))
    con.commit()
    cursor.close()
    con.close()

    return {"session_id": session_id}