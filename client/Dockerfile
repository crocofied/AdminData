FROM node:22.9.0-alpine AS build

ARG VITE_API_KEY
ARG VITE_API_URL

ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]