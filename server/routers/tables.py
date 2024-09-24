from fastapi import APIRouter, Request, Depends, HTTPException
from ..dependencies import token_required, connect_database
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
async def get_tables(request: Request, token=Depends(token_required)) -> Page[Table]:
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
async def delete_table(request: Request, token=Depends(token_required)):
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

add_pagination(router)