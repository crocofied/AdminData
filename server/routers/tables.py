from fastapi import APIRouter, Request, HTTPException
from ..dependencies import connect_database, validate_session
import mysql.connector
from fastapi_pagination import Page, add_pagination, paginate
from pydantic import BaseModel

router = APIRouter()  # Create a router

class Table(BaseModel):
    name: str
    rows: int = 0
    size: str

# Define a route to initialize the database
@router.post("/get_tables", tags=["tables"])
async def get_tables(request: Request) -> Page[Table]:
    await validate_session(request)

    data = await request.json()
    database = data.get('database')
    connection_id = data.get('connection_id')

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM `databases` WHERE id=?", (connection_id,))
    connection = cursor.fetchone()
    con.close()

    if connection is None:
        raise HTTPException(status_code=404, detail="Connection not found")

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
        database=database
    )
    cursor = con.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()

    if tables is None:
        cursor.close()
        con.close()
        return []

    table_list = []

    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM `{table[0]}`")
        rows = cursor.fetchone()[0]

        cursor.fetchall()  # Fetch all remaining results to clear the buffer
        cursor.execute(f"SELECT data_length + index_length FROM information_schema.tables WHERE table_name = '{table[0]}'")
        
        size = cursor.fetchone()[0]
        if size is None:
            size = "Unknown"
            continue
        size = f"{size / 1024:.2f} KB" if size < 1024 ** 2 else f"{size / 1024 ** 2:.2f} MB"

        cursor.fetchall()  # Fetch all remaining results to clear the buffer
        table_list.append(Table(name=table[0], rows=rows, size=size))
    cursor.close()
    con.close()

    databases = sorted(table_list, key=lambda x: x.name)
    return paginate(databases)

@router.post("/delete_table", tags=["tables"])
async def delete_table(request: Request):
    await validate_session(request)

    data = await request.json()
    database = data.get('database')
    connection_id = data.get('connection_id')
    table = data.get('table')

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM `databases` WHERE id=?", (connection_id,))
    connection = cursor.fetchone()
    con.close()

    if connection is None:
        raise HTTPException(status_code=404, detail="Connection not found")

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
        database=database
    )
    cursor = con.cursor()
    cursor.execute(f"DROP TABLE `{table}`")
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Table deleted"}

@router.post("/create_table", tags=["tables"])
async def create_table(request: Request):
    await validate_session(request)

    data = await request.json()
    database = data.get('database')
    connection_id = data.get('connection_id')
    table = data.get('table')
    columns = data.get('columns')

    con, cursor = connect_database()
    cursor.execute("SELECT * FROM `databases` WHERE id=?", (connection_id,))
    connection = cursor.fetchone()
    con.close()

    if connection is None:
        raise HTTPException(status_code=404, detail="Connection not found")

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
        database=database
    )
    cursor = con.cursor()

    # Convert column definitions to SQL format
    column_definitions = []
    index_definitions = []
    for column in columns:
        column_def = f"`{column['name']}` {column['type']}"
        if column['length']:
            column_def += f"({column['length']})"
        if column['default']:
            column_def += f" DEFAULT '{column['default']}'"
        if column['autoIncrement']:
            column_def += " AUTO_INCREMENT"
        column_definitions.append(column_def)
        
        if column.get('index'):
            index_definitions.append(f"INDEX (`{column['name']}`)")

    create_table_sql = f"CREATE TABLE `{table}` ({', '.join(column_definitions + index_definitions)})"
    try:
        cursor.execute(create_table_sql)
        con.commit()
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=f"Error: {err.msg}")
    finally:
        cursor.close()
        con.close()

    return {"message": "Table created"}

add_pagination(router)