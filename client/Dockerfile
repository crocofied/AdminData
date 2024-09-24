FROM node:22.9.0-alpine AS build

ARG VITE_HOST_IP

ENV VITE_HOST_IP=$VITE_HOST_IP

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]