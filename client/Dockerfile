FROM node:22.9.0-alpine AS build

ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopieren und Ausführbar machen des env.sh Skripts
COPY env.sh /env.sh
RUN chmod +x /env.sh

EXPOSE 80

# Verwenden des env.sh Skripts als Einstiegspunkt
CMD ["/env.sh"]