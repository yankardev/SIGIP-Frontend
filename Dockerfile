# syntax=docker/dockerfile:1
# Frontend Angular de SIGIP.
# Etapa 1: compila con Node. Etapa 2: nginx sirve los archivos estáticos y reenvía /api al API Gateway.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# URL interna del gateway (en docker-compose es el nombre del servicio). En la nube se cambia por variable.
ENV API_GATEWAY_URL=http://api-gateway:8090
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
