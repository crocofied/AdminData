# 🚀 Reverse Proxy


### 🔗 - Domains
If you want to put the application behind a domain, first point 1 (sub)domain to the client `<YOUR_SERVER_IP>:3000` and another (sub)domain to your server api `<YOUR_SERVER_IP>:5000`.

### ⚙️ - Environment Setup
Edit the .env file in your AdminDirectory:
```sh
nano .env
```
and replace your old `VITE_API_URL` with
```
VITE_API_URL=http://<YOUR_SERVER_API_DOMAIN>
CLIENT_URL=http://<YOUR_CLIENT_DOMAIN>
```
or if you have an SLL certificate:
```
VITE_API_URL=https://<YOUR_SERVER_API_DOMAIN>
CLIENT_URL=https://<YOUR_CLIENT_DOMAIN>
```
### 🐳 - Rebuild container & launch application
```sh
docker compose up --build -d
```