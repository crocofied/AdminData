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
        if column["index"]:
            column_def += " UNIQUE"
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

@router.post("/get_table_data", tags=["tables"])
async def get_table_data(request: Request):
    await validate_session(request)

    data = await request.json()
    print(data)
    database = data.get('database_name')
    connection_id = data.get('connection_id')
    table = data.get('table_name')
    print(database, connection_id, table)

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
    # Get all colum names, type, length, default, index, autoIncrement
    cursor = con.cursor()
    cursor.execute(f"SHOW COLUMNS FROM `{table}`")
    columns = cursor.fetchall()
    print(columns)
    cursor.execute(f"SHOW INDEX FROM `{table}`")
    indexes = cursor.fetchall()
    print(indexes)


    column_data = []
    for column in columns:
        cursor.execute(f"SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.columns WHERE table_name = '{table}' AND column_name = '{column[0]}'")
        column_data.append({    
            "name": column[0],
            "type": column[1],
            "length": cursor.fetchone()[0],
            "default": column[4],
            "index": column[3] != "",
            "autoIncrement": column[5] == "auto_increment"
        })
    cursor.close()
    con.close()

    return {"columns": column_data}

@router.post("/edit_table", tags=["tables"])
async def edit_table(request: Request):
    data = await request.json()
    database = data.get('database_name')
    connection_id = data.get('connection_id')
    table = data.get('table_name')
    new_table = data.get('new_table_name')
    columns = data.get('columns')

    # Connect to your admin database to fetch connection details
    con, cursor = connect_database()  # You should define this function
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

    old_name = cursor.fetchall()

    # Rename Table
    if not old_name:
        cursor.execute(f"ALTER TABLE `{table}` RENAME TO `{new_table}`")
        con.commit()

    # Get old columns
    cursor.execute(f"SHOW COLUMNS FROM `{new_table}`")
    columns_old = cursor.fetchall()
    
    for column in columns:
        column_name = column['name']
        column_type = column['type']
        column_length = column.get('length', None)
        column_default = column.get('default', None)
        column_auto_increment = column.get('autoIncrement', False)

        # Check if column data has changed
        for old_column in columns_old:
            if old_column[0] == column_name:
                if (old_column[1] != column_type or 
                    old_column[4] != column_default or 
                    old_column[5] != column_auto_increment):
                    
                    # Change column
                    length_clause = f'({column_length})' if column_length and 'text' not in column_type else ''
                    default_clause = f'DEFAULT {column_default}' if column_default else ''
                    auto_increment_clause = 'AUTO_INCREMENT' if column_auto_increment else ''
                    
                    sql = f"""
                        ALTER TABLE `{new_table}` 
                        CHANGE `{column_name}` `{column_name}` {column_type}
                        {length_clause} {default_clause} {auto_increment_clause}
                    """.strip()
                    print("Executing SQL:", sql)
                    cursor.execute(sql)
                    con.commit()
                break
        else:
            # Add column
            length_clause = f'({column_length})' if column_length and 'text' not in column_type else ''
            default_clause = f'DEFAULT {column_default}' if column_default else ''
            auto_increment_clause = 'AUTO_INCREMENT' if column_auto_increment else ''
            
            sql = f"""
                ALTER TABLE `{new_table}` 
                ADD COLUMN `{column_name}` {column_type}
                {length_clause} {default_clause} {auto_increment_clause}
            """.strip()
            print("Executing SQL:", sql)
            cursor.execute(sql)
            con.commit()

    # Remove columns
    for old_column in columns_old:
        for column in columns:
            if old_column[0] == column['name']:
                break
        else:
            cursor.execute(f"ALTER TABLE `{new_table}` DROP COLUMN `{old_column[0]}`")
            con.commit()

    cursor.close()
    con.close()    

    return {"message": "Table edited"}

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