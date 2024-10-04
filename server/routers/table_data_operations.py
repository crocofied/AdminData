from fastapi import APIRouter, Request, HTTPException
from ..dependencies import connect_database, validate_session
import mysql.connector
from fastapi_pagination import Page, add_pagination, paginate
from pydantic import BaseModel

router = APIRouter()  # Create a router


class Row(BaseModel):
    values: dict

@router.post("/get_table_data_values", tags=["tables"], response_model=Page[Row])
async def get_table_data_values(request: Request) -> Page[Row]:
    await validate_session(request)

    data = await request.json()
    database = data.get('database_name')
    connection_id = data.get('connection_id')
    table = data.get('table_name')

    # Connect to your admin database to fetch connection details
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
    cursor.execute(f"SELECT * FROM `{table}`")
    data = cursor.fetchall()
    cursor.execute(f"SHOW COLUMNS FROM `{table}`")
    columns = cursor.fetchall()
    cursor.close()
    con.close()

    print(data, columns)

    # Check if the data is empty
    if not data:  # This checks if data is an empty list
        print("check")
        column_names = [column[0] for column in columns]
        data_dicts = [dict(zip(column_names, [None] * len(column_names)))]
        wrapped_data = [{"values": row} for row in data_dicts]
        paginated_data = paginate(wrapped_data)
        return paginated_data

    # Convert tuples to dictionaries
    column_names = [column[0] for column in columns]
    data_dicts = [dict(zip(column_names, row)) for row in data]

    # Wrap each dictionary in another dictionary with the key 'values'
    wrapped_data = [{"values": row} for row in data_dicts]

    # Paginate the wrapped data
    paginated_data = paginate(wrapped_data)

    return paginated_data

@router.post("/delete_table_data", tags=["tables"])
async def delete_table_data(request: Request):
    await validate_session(request)

    data = await request.json()
    database = data.get('database_name')
    connection_id = data.get('connection_id')
    table = data.get('table_name')
    row = data.get('row')  # get the data of the entire row in an array

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

    # Create the WHERE clause
    where_clauses = []
    values = []
    for key, value in row['values'].items():
        if value is None:
            where_clauses.append(f"`{key}` IS NULL")
        else:
            where_clauses.append(f"`{key}` = %s")
            values.append(value)

    where_clause = " AND ".join(where_clauses)

    sql = f"DELETE FROM `{table}` WHERE {where_clause}"


    cursor.execute(sql, values)
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Row deleted"}


@router.post("/edit_table_data", tags=["tables"])
async def edit_table_data(request: Request):
    await validate_session(request)

    data = await request.json()
    database = data.get('database_name')
    connection_id = data.get('connection_id')
    table = data.get('table_name')
    row = data.get('row')  # get the old data of the row
    new_row = data.get('new_row')  # get the new data of the row

    print(row, new_row)

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

    # Create the SET clause
    set_clauses = []
    values = []

    for key, value in new_row['values'].items():
        if value is None:
            set_clauses.append(f"`{key}` = NULL")
        else:
            set_clauses.append(f"`{key}` = %s")  # Use %s placeholder for values
            values.append(value)  # Append value for later execution

    set_clause = ", ".join(set_clauses)

    # Create the WHERE clause
    where_clauses = []

    for key, value in row['values'].items():
        if value is None:
            where_clauses.append(f"`{key}` IS NULL")
        else:
            where_clauses.append(f"`{key}` = %s")  # Use %s placeholder for values
            values.append(value)  # Append value for later execution

    where_clause = " AND ".join(where_clauses)


    sql = f"UPDATE `{table}` SET {set_clause} WHERE {where_clause}"
    print(sql, values)
    cursor.execute(sql, values)
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Row updated"}


@router.post("/add_table_data", tags=["tables"])
async def add_table_data(request: Request):
    await validate_session(request)

    data = await request.json()
    database = data.get('database_name')
    connection_id = data.get('connection_id')
    table = data.get('table_name')
    row = data.get('row')

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

    # Create the INSERT INTO clause
    columns = []
    values = []
    for key, value in row['values'].items():
        columns.append(f"`{key}`")
        values.append(value)

    columns_clause = ", ".join(columns)
    values_clause = ", ".join(["%s"] * len(values))

    sql = f"INSERT INTO `{table}` ({columns_clause}) VALUES ({values_clause})"

    cursor.execute(sql, values)
    con.commit()
    cursor.close()
    con.close()

    return {"message": "Row added"}


add_pagination(router)