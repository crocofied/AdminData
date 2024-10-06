# 🚀 Installation
> [!CAUTION]
> AdminData is currently in an early stage of development and is subject to change at any time. It is not recommended for use in a production environment at this time.

### 📦 · Docker Compose
Create the docker compose file
```sh
nano docker-compose.yml
```
Insert the following code
```yaml
services:
  client:
    image: damiandbergemann278/admindata-client:latest
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://<YOUR_IP>:5000
    depends_on:
      - server
    restart: always
  server:
    image: damiandbergemann278/admindata-server:latest
    ports:
      - "5000:5000"
    volumes:
      - db_data:/app/db
    environment:
      - CLIENT_URL=http://<YOUR_IP>:3000
    restart: always
volumes:
  db_data:
```

### 🐳 · Start Application through docker
```sh
docker compose up --build -d
```

> Your application should now run on http://<YOUR_SERVER_IP>:3000. Default login is User: admin Password: admin
