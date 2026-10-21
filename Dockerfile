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
# Puerto interno definido en SIGIP-Api-Gateway (server.port=${PORT:9002}).
# En Docker Compose, API_GATEWAY_URL debe apuntar al nombre del servicio y al puerto 9002.
ENV API_GATEWAY_URL=http://api-gateway:9002
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
