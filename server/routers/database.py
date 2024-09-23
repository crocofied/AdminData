# =========================== IMPORTS ===========================
from fastapi import APIRouter
from fastapi import  Request, Depends, HTTPException
import bcrypt
from ..dependencies import token_required, connect_database

router = APIRouter() # Create a router

# Define a route to initialize the database
@router.post("/add_connection", tags=["database"])
async def add_connection(request: Request, token=Depends(token_required)):
    data = await request.json()
    # get user id from session id
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM sessions WHERE token=%s", (data.get("session_id"),))
    session = cursor.fetchone()
    user_id = session[1]

    cursor.execute("INSERT INTO `databases` (userid, name, type, host, port, user, password) VALUES (%s, %s, %s, %s, %s, %s, %s)", (user_id, data.get("name"), int(data.get("type")), data.get("host"), data.get("port"), data.get("user"), data.get("password")))
    con.commit()
    cursor.close()
    con.close()
    return {"message": "Connection added"}

@router.post("/get_connections", tags=["database"])
async def get_connections(request: Request, token=Depends(token_required)):
    data = await request.json()
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM sessions WHERE token=%s", (data.get("session_id"),))
    session = cursor.fetchone()
    user_id = session[1]

    cursor.execute("SELECT * FROM `databases` WHERE userid=%s", (user_id,))
    connections = cursor.fetchall()
    cursor.close()
    con.close()
    return {"connections": connections}

@router.post("/edit_connection", tags=["database"])
async def edit_connection(request: Request, token=Depends(token_required)):
    data = await request.json()
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM sessions WHERE token=%s", (data.get("session_id"),))
    session = cursor.fetchone()
    user_id = session[1]

    if data.get("password") == "":
        cursor.execute("UPDATE `databases` SET name=%s, type=%s, host=%s, port=%s, user=%s WHERE id=%s AND userid=%s", (data.get("name"), int(data.get("type")), data.get("host"), data.get("port"), data.get("user"), int(data.get("id")), user_id))
    else:
        cursor.execute("UPDATE `databases` SET name=%s, type=%s, host=%s, port=%s, user=%s, password=%s WHERE id=%s AND userid=%s", (data.get("name"), int(data.get("type")), data.get("host"), data.get("port"), data.get("user"), data.get("password"), int(data.get("id")), user_id))
    con.commit()
    cursor.close()
    con.close()
    return {"message": "Connection updated"}

@router.post("/delete_connection", tags=["database"])
async def delete_connection(request: Request, token=Depends(token_required)):
    data = await request.json()
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM sessions WHERE token=%s", (data.get("session_id"),))
    session = cursor.fetchone()
    user_id = session[1]

    cursor.execute("DELETE FROM `databases` WHERE id=%s AND userid=%s", (int(data.get("id")), user_id))
    con.commit()
    cursor.close()
    con.close()
    return {"message": "Connection deleted"}