# 🚀 Reverse Proxy


### 🔗 - Domains
If you want to put the application behind a domain, first point 1 (sub)domain to the client `<YOUR_SERVER_IP>:3000` and another (sub)domain to your server api `<YOUR_SERVER_IP>:5000`.

### ⚙️ - Docker Compose Setup
Edit the docker-compose.yml file in your AdminDirectory:
```sh
nano docker-compose.yml
```
and replace your old `VITE_API_URL` with
```
services:
  client:
    image: damiandbergemann278/admindata-client:latest
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=https://<YOUR_SERVER_API_DOMAIN>
    depends_on:
      - server

  server:
    image: damiandbergemann278/admindata-server:latest
    ports:
      - "5000:5000"
    volumes:
      - db_data:/app/db
    environment:
      - CLIENT_URL=https://<YOUR_CLIENT_DOMAIN>

volumes:
  db_data:
```

### 🐳 - Rebuild container & launch application
```sh
docker compose down
docker compose up --build -d
```