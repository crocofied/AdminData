from fastapi import APIRouter, Request, Depends, HTTPException
from ..dependencies import token_required, connect_database
import mysql.connector
from fastapi_pagination import Page, add_pagination, paginate
from pydantic import BaseModel

router = APIRouter()  # Create a router

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

class DatabaseOut(BaseModel):
    name: str

@router.post("/get_databases", tags=["database"])
async def get_databases(request: Request, token=Depends(token_required)) -> Page[DatabaseOut]:
    data = await request.json()
    connection_id = data.get("connection_id")

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM `databases` WHERE id=%s", (connection_id,))
    connection = cursor.fetchone()
    cursor.close()
    con.close()

    host = connection[4]
    port = connection[5]
    user = connection[6]
    password = connection[7]

    con = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        collation='utf8mb4_general_ci',
        database=None
    )
    cursor = con.cursor()
    cursor.execute("SHOW DATABASES")
    databases = cursor.fetchall()
    cursor.close()
    con.close()
    
    # Sort the databases alphabetically in a case-insensitive manner
    databases = sorted([DatabaseOut(name=database[0]) for database in databases], key=lambda db: db.name.lower())
    return paginate(databases)

@router.post("/edit_database", tags=["database"])
async def edit_database(request: Request, token=Depends(token_required)):
    data = await request.json()
    connection_id = data.get("connection_id")

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM `databases` WHERE id=%s", (connection_id,))
    connection = cursor.fetchone()
    cursor.close()
    con.close()

    host = connection[4]
    port = connection[5]
    user = connection[6]
    password = connection[7]

    old_database_name = data.get("old_database_name")
    new_database_name = data.get("new_database_name")
    if old_database_name == new_database_name:
        return {"message": "Database edited"}
    # Check length of new database name
    if len(new_database_name) > 64:
        return {"message": "Database name too long"}
    # Check if / \ . are in the new database name
    # Check if new database name is empty
    if new_database_name == "":
        return {"message": "Database name cannot be empty"}
    # Check if characters are alphanumeric
    if not new_database_name.isalnum():
        return {"message": "Database name can only contain alphanumeric characters"}
    # Check if database ends with space character
    if new_database_name.endswith(" "):
        return {"message": "Database name cannot end with a space character"}

    con = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        collation='utf8mb4_general_ci',
        database=None
    )
    cursor = con.cursor()
    cursor.execute(f"CREATE DATABASE {new_database_name}")
    con.commit()
    cursor.close()

    con = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        collation='utf8mb4_general_ci',
        database=old_database_name
    )
    cursor = con.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    for (table_name,) in tables:
        cursor.execute(f"RENAME TABLE your_old_database.{table_name} TO {new_database_name}.{table_name}")
    con.commit()
    cursor.execute(f"DROP DATABASE {old_database_name}")
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Database edited"}

@router.post("/delete_database", tags=["database"])
async def delete_database(request: Request, token=Depends(token_required)):
    data = await request.json()
    connection_id = data.get("connection_id")

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM `databases` WHERE id=%s", (connection_id,))
    connection = cursor.fetchone()
    cursor.close()
    con.close()

    host = connection[4]
    port = connection[5]
    user = connection[6]
    password = connection[7]

    database_name = data.get("database_name")

    con = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        collation='utf8mb4_general_ci',
        database=None
    )
    cursor = con.cursor()
    cursor.execute(f"DROP DATABASE {database_name}")
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Database deleted"}


@router.post("/create_database", tags=["database"])
async def create_database(request: Request, token=Depends(token_required)):
    data = await request.json()
    connection_id = data.get("connection_id")

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM `databases` WHERE id=%s", (connection_id,))
    connection = cursor.fetchone()
    cursor.close()
    con.close()

    host = connection[4]
    port = connection[5]
    user = connection[6]
    password = connection[7]

    database_name = data.get("database_name")
    # Check length of database name
    if len(database_name) > 64:
        return {"message": "Database name too long"}
    # Check if / \ . are in the database name
    # Check if database name is empty
    if database_name == "":
        return {"message": "Database name cannot be empty"}
    # Check if characters are alphanumeric
    if not database_name.isalnum():
        return {"message": "Database name can only contain alphanumeric characters"}
    # Check if database ends with space character
    if database_name.endswith(" "):
        return {"message": "Database name cannot end with a space character"}

    con = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        collation='utf8mb4_general_ci',
        database=None
    )
    cursor = con.cursor()
    cursor.execute(f"CREATE DATABASE {database_name}")
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Database created"}
    

add_pagination(router)