FROM python:3.12.1-slim

ARG CLIENT_URL
ENV CLIENT_URL=${CLIENT_URL}

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["fastapi", "run", "app.py", "--proxy-headers", "--port", "5000"]