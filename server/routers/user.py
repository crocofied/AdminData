# =========================== IMPORTS ===========================
from fastapi import APIRouter
from fastapi import  Request, Depends, HTTPException
import bcrypt
import secrets
from ..dependencies import token_required, connect_database

router = APIRouter() # Create a router


@router.post("/login")
async def login(request: Request, token=Depends(token_required)):
    # Fetch the username and password from the request body
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    # Get the user from the database
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    user = cursor.fetchone()

    # Check if the user exists and if the password is correct
    if not user or not bcrypt.checkpw(password.encode(), user[2]):
        cursor.close()
        con.close()
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Create a session id and store it in the database
    session_id = secrets.token_hex(20)
    cursor.execute("INSERT INTO sessions (user_id, token) VALUES (?, ?)", (user[0], session_id))
    con.commit()
    cursor.close()
    con.close()

    return {"session_id": session_id}

@router.post("/check_session")
async def check_session(request: Request, token=Depends(token_required)):
    # Fetch the session id from the request body
    data = await request.json()
    session_id = data.get("session_id")

    # Get the user from the database
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM sessions WHERE token=?", (session_id,))
    session = cursor.fetchone()
    cursor.close()
    con.close()

    # Check if the session exists
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return {"message": "Session is valid"}

@router.post("/logout")
async def logout(request: Request, token=Depends(token_required)):
    # Fetch the session id from the request body
    data = await request.json()
    session_id = data.get("session_id")

    # Get the user from the database
    con, cursor = connect_database()
    cursor.execute("DELETE FROM sessions WHERE token=?", (session_id,))
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Logged out successfully"}

@router.post("/change_password")
async def change_password(request: Request, token=Depends(token_required)):
    # Fetch the username, old password, and new password from the request body
    data = await request.json()
    session_id = data.get("session_id")
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    # Get the user from the database
    con, cursor = connect_database()
    cursor.execute("SELECT user_id FROM sessions WHERE token=?", (session_id,))
    user_id = cursor.fetchone()[0]
    cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))
    user = cursor.fetchone()

    # Check if the user exists and if the current password is correct
    if not user or not bcrypt.checkpw(current_password.encode(), user[2]):
        cursor.close()
        con.close()
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Generate a new salt and hash the new password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(new_password.encode(), salt)

    # Update the user's password in the database
    cursor.execute("UPDATE users SET password=?, salt=? WHERE id=?", (hashed, salt, user_id))
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Password changed successfully"}