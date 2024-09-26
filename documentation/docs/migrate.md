# 🚀 Migrate


### ⚙️ - Stop old containers
```sh
docker compose down
```

### 📦 - Download the database file
Navigate to 
```
/var/lib/docker/volumes/admindata_db_data/_data
```
and download the file admin_data.db.


### 🐳 - Running the application on another server
You can now follow the installation instructions to install AdminData on your new server: [Install](/install)

### 📤 - Upload database file
Navigate to
```
/var/lib/docker/volumes/admindata_db_data/_data
```
on the new server and upload your previously downloaded db file.

> Your application will now be successfully transferred.