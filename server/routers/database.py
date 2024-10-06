from fastapi import APIRouter, Request, Depends, HTTPException
from ..dependencies import connect_database, validate_session
import mysql.connector
from fastapi_pagination import Page, add_pagination, paginate
from pydantic import BaseModel
import sqlite3
from mysql.connector import errors as mysql_errors

router = APIRouter()  # Create a router

# Define a route to initialize the database
@router.post("/add_connection", tags=["database"])
async def add_connection(request: Request):
    await validate_session(request)

    data = await request.json()
    
    # Check database connection
    try:
        con = mysql.connector.connect(
            host=data.get("host"),
            port=data.get("port"),
            user=data.get("user"),
            password=data.get("password"),
            collation='utf8mb4_general_ci',
            database=None,
            connect_timeout=5
        )
        cursor = con.cursor()
        cursor.execute("SHOW DATABASES")
        result = cursor.fetchall()
        cursor.close()
        con.close()
    except (mysql_errors.InterfaceError, mysql_errors.OperationalError) as e:
        return {"message": f"Connection failed"}

    # get user id from session id
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM sessions WHERE token=?", (request.cookies.get("session_id"),))
    session = cursor.fetchone()
    user_id = session[1]

    cursor.execute("INSERT INTO databases (userid, name, type, host, port, user, password) VALUES (?, ?, ?, ?, ?, ?, ?)", (user_id, data.get("name"), int(data.get("type")), data.get("host"), data.get("port"), data.get("user"), data.get("password")))
    con.commit()
    cursor.close()
    con.close()
    return {"message": "Connection added"}

@router.post("/get_connections", tags=["database"])
async def get_connections(request: Request):
    await validate_session(request)

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM sessions WHERE token=?", (request.cookies.get("session_id"),))
    session = cursor.fetchone()
    user_id = session[1]

    cursor.execute("SELECT * FROM databases WHERE userid=?", (user_id,))
    connections = cursor.fetchall()
    cursor.close()
    con.close()
    return {"connections": connections}

@router.post("/edit_connection", tags=["database"])
async def edit_connection(request: Request):
    await validate_session(request)

    data = await request.json()
    # Get database password from connection table
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM databases WHERE id=?", (data.get("id"),))
    connection = cursor.fetchone()
    cursor.close()
    con.close()
    database_password = connection[7]
    # Check database connection
    try:
        con = mysql.connector.connect(
            host=data.get("host"),
            port=data.get("port"),
            user=data.get("user"),
            password=database_password,
            collation='utf8mb4_general_ci',
            database=None,
            connect_timeout=5
        )
        cursor = con.cursor()
        cursor.execute("SHOW DATABASES")
        result = cursor.fetchall()
        cursor.close()
        con.close()
    except (mysql_errors.InterfaceError, mysql_errors.OperationalError) as e:
        return {"message": f"Connection failed"}

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM sessions WHERE token=?", (request.cookies.get("session_id"),))
    session = cursor.fetchone()
    user_id = session[1]

    if data.get("password") == "":
        cursor.execute("UPDATE databases SET name=?, type=?, host=?, port=?, user=? WHERE id=? AND userid=?", (data.get("name"), int(data.get("type")), data.get("host"), data.get("port"), data.get("user"), int(data.get("id")), user_id))
    else:
        cursor.execute("UPDATE databases SET name=?, type=?, host=?, port=?, user=?, password=? WHERE id=? AND userid=?", (data.get("name"), int(data.get("type")), data.get("host"), data.get("port"), data.get("user"), data.get("password"), int(data.get("id")), user_id))
    con.commit()
    cursor.close()
    con.close()
    return {"message": "Connection updated"}

@router.post("/delete_connection", tags=["database"])
async def delete_connection(request: Request):
    await validate_session(request)

    data = await request.json()
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM sessions WHERE token=?", (request.cookies.get("session_id"),))
    session = cursor.fetchone()
    user_id = session[1]

    cursor.execute("DELETE FROM databases WHERE id=? AND userid=?", (int(data.get("id")), user_id))
    con.commit()
    cursor.close()
    con.close()
    return {"message": "Connection deleted"}

class DatabaseOut(BaseModel):
    name: str

@router.post("/get_databases", tags=["database"])
async def get_databases(request: Request) -> Page[DatabaseOut]:
    await validate_session(request)

    data = await request.json()
    connection_id = data.get("connection_id")

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM databases WHERE id=?", (connection_id,))
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

    if databases is None:
        return []
    
    # Sort the databases alphabetically in a case-insensitive manner
    databases = sorted([DatabaseOut(name=database[0]) for database in databases], key=lambda db: db.name.lower())
    return paginate(databases)

@router.post("/edit_database", tags=["database"])
async def edit_database(request: Request):
    await validate_session(request)

    data = await request.json()
    connection_id = data.get("connection_id")

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM databases WHERE id=?", (connection_id,))
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
        cursor.execute(f"RENAME TABLE {old_database_name}.{table_name} TO {new_database_name}.{table_name}")
    con.commit()
    cursor.execute(f"DROP DATABASE {old_database_name}")
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Database edited"}

@router.post("/delete_database", tags=["database"])
async def delete_database(request: Request):
    await validate_session(request)

    data = await request.json()
    connection_id = data.get("connection_id")

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM databases WHERE id=?", (connection_id,))
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
async def create_database(request: Request):
    await validate_session(request)

    data = await request.json()
    connection_id = data.get("connection_id")

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM databases WHERE id=?", (connection_id,))
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

@router.post("/run_query", tags=["database"])
async def run_query(request: Request):
    await validate_session(request)

    data = await request.json()
    database_name = data.get("database")
    if database_name == "none":
        database_name = None
    query = data.get("query")
    connection_id = data.get("connection_id")

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM databases WHERE id=?", (connection_id,))
    connection = cursor.fetchone()
    cursor.close()
    con.close()

    host = connection[4]
    port = connection[5]
    user = connection[6]
    password = connection[7]

    try:
        con = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            collation='utf8mb4_general_ci',
            database=database_name
        )
        cursor = con.cursor()
        
        # Ausführen mehrerer Anweisungen
        results = []
        for statement in query.split(';'):
            if statement.strip():
                if statement.strip().endswith(";"):
                    statement = statement.strip()
                else:
                    statement = statement.strip() + ";" 
                cursor.execute(statement)
                print(statement)
                try:
                    result = cursor.fetchall()
                    results.append(result)
                except mysql.connector.errors.InterfaceError:
                    # Wenn keine Ergebnisse zurückgegeben werden (z.B. bei INSERT, UPDATE, DELETE)
                    results.append({"affected_rows": cursor.rowcount})
        
        con.commit()  # Commit Änderungen für nicht-SELECT Anweisungen
        cursor.close()
        con.close()
        return {"results": results}
    except mysql.connector.Error as err:
        return {"error": str(err)}
    

@router.post("/check_if_root_database_user", tags=["database"])
async def check_if_root_database_user(request: Request):
    await validate_session(request)

    data = await request.json()
    connection_id = data.get("connection_id")
    
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM databases WHERE id=?", (connection_id,))
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
    cursor.execute("SELECT * FROM mysql.user WHERE user = 'root'")
    result = cursor.fetchone()
    cursor.close()
    con.close()

    if result:
        return {"message": "Database user is root"}
    else:
        return {"message": "Database user is not root"}
    

@router.post("/get_database_users", tags=["database"])
async def get_database_users(request: Request):
    await validate_session(request)

    data = await request.json()
    connection_id = data.get("connection_id")
    
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM databases WHERE id=?", (connection_id,))
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
    # Get users, host and permissions
    cursor.execute("SELECT user, host, plugin FROM mysql.user")
    users = cursor.fetchall()
    cursor.close()
    con.close()

    # Filter out users managed by the mysql server
    users = [user for user in users if user[2] != "mysql_native_password"]

    return {"users": users}

@router.post("/create_database_user", tags=["database"])
async def create_database_user(request: Request):
    await validate_session(request)

    data = await request.json()
    connection_id = data.get("connection_id")
    
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM databases WHERE id=?", (connection_id,))
    connection = cursor.fetchone()
    cursor.close()
    con.close()

    host = connection[4]
    port = connection[5]
    user = connection[6]
    password = connection[7]

    new_username = data.get("new_username")
    new_password = data.get("new_password")
    new_host = data.get("new_host")
    new_plugin = data.get("new_plugin")
    grant_all_privileges = data.get("grant_all_privileges")
    grant_all_privileges_on = data.get("grant_all_privileges_on")

    con = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        collation='utf8mb4_general_ci',
        database=None
    )
    cursor = con.cursor()
    cursor.execute(f"CREATE USER '{new_username}'@'{new_host}' IDENTIFIED BY '{new_password}'")
    if grant_all_privileges:
        cursor.execute(f"GRANT ALL PRIVILEGES ON {grant_all_privileges_on}.* TO '{new_username}'@'{new_host}'")
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Database user created"}

@router.post("/delete_database_user", tags=["database"])
async def delete_database_user(request: Request):
    await validate_session(request)

    data = await request.json()
    connection_id = data.get("connection_id")
    username = data.get("username")
    host = data.get("host")
    
    con, cursor = connect_database()
    cursor.execute("SELECT * FROM databases WHERE id=?", (connection_id,))
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
    cursor.execute(f"DROP USER '{username}'@'{host}'")
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Database user deleted"}

add_pagination(router)