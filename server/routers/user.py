# =========================== IMPORTS ===========================
from fastapi import APIRouter
from fastapi import  Request, HTTPException
import bcrypt
import secrets

from fastapi.responses import JSONResponse
from ..dependencies import connect_database, validate_session

router = APIRouter() # Create a router


@router.post("/login")
async def login(request: Request):
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

    response = {"message": "success", "language": user[4]}
    response = JSONResponse(content=response)
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        samesite='Lax',
        max_age=3600  # or however long you want the session to last
    )
    return response

@router.post("/check_session")
async def check_session(request: Request):
    # Fetch the session id from the request body
    session_id = request.cookies.get("session_id")

    # Get the user from the database
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM sessions WHERE token=?", (session_id,))
    session = cursor.fetchone()
    cursor.close()
    con.close()

    # Check if the session exists
    if not session:
        return {"message": "Session is invalid"}

    return {"message": "Session is valid"}

@router.post("/logout")
async def logout(request: Request):
    # Fetch the session id from the request body
    session_id = request.cookies.get("session_id")

    # Get the user from the database
    con, cursor = connect_database()
    cursor.execute("DELETE FROM sessions WHERE token=?", (session_id,))
    con.commit()
    cursor.close()
    con.close()

    # delete the session id cookie
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie(
        key="session_id",
        httponly=True,
        samesite='Lax'
    )
    return response


@router.post("/change_password")
async def change_password(request: Request):
    await validate_session(request)

    # Fetch the username, old password, and new password from the request body
    data = await request.json()
    session_id = request.cookies.get("session_id")
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

@router.post("/change_username")
async def change_username(request: Request):
    await validate_session(request)

    # Fetch th new username
    data = await request.json()
    session_id = request.cookies.get("session_id")
    new_username = data.get("new_username")
    password = data.get("password")

    # Get the user from the database
    con, cursor = connect_database()
    cursor.execute("SELECT user_id FROM sessions WHERE token=?", (session_id,))
    user_id = cursor.fetchone()[0]

    cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))
    user = cursor.fetchone()

    # Check if the user exists and if the password is correct
    if not user or not bcrypt.checkpw(password.encode(), user[2]):
        cursor.close()
        con.close()
        return {"message": "Invalid password"}
    
    cursor.execute("UPDATE users SET username=? WHERE id=?", (new_username, user_id))
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Username changed successfully"}

@router.post("/change_language")
async def change_language(request: Request):
    await validate_session(request)

    # Fetch the new language
    data = await request.json()
    session_id = request.cookies.get("session_id")
    new_language = data.get("new_language")

    # Get the user from the database
    con, cursor = connect_database()
    cursor.execute("SELECT user_id FROM sessions WHERE token=?", (session_id,))
    user_id = cursor.fetchone()[0]

    cursor.execute("UPDATE users SET language=? WHERE id=?", (new_language, user_id))
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Language changed successfully"}

@router.post("/get_language")
async def get_language(request: Request):
    await validate_session(request)

    # Fetch the language
    session_id = request.cookies.get("session_id")
    con, cursor = connect_database()
    cursor.execute("SELECT user_id FROM sessions WHERE token=?", (session_id,))
    user_id = cursor.fetchone()[0]
    cursor.execute("SELECT language FROM users WHERE id=?", (user_id,))
    language = cursor.fetchone()[0]
    cursor.close()
    con.close()

    return {"language": language}