# 🚀 Installation
> [!CAUTION]
> AdminData is currently in an early stage of development and is subject to change at any time. It is not recommended for use in a production environment at this time.

### 📦 · Clone Github Repo
```sh
git clone https://github.com/crocofied/AdminData && cd AdminData
```

### ⚙️ · Enviroment Setup
```sh
cp .env.example .env && nano .env
```
Replace <YOUR_SERVER_IP> with your server host ip
```
VITE_API_URL=http://<YOUR_SERVER_IP>:5000
```
Save your changes and close the editor.

### 🐳 · Start Application through docker
```sh
docker compose up -d
```

> Your application should now run on http://<YOUR_SERVER_IP>:3000. Default login is User: admin Password: admin
