# SIGIP · Frontend Angular

Interfaz web de SIGIP (cliente y administrador). Consume el backend a través del API Gateway.
Documentación completa: [docs/10-frontend.md](../docs/10-frontend.md).

## Requisitos

Node.js 22 o 24 y el backend levantado (`docker compose up -d --build` desde la raíz, o IntelliJ).

## Comandos

```bash
npm install     # una sola vez
npm start       # http://localhost:4200 (llama al gateway http://localhost:8090)
npm test        # pruebas unitarias con Vitest
npm run build   # build de producción en dist/frontend/browser
```

Usuario inicial: `admin` / `Admin12345`. Los clientes se registran desde "Crea tu cuenta".

## Docker

`Dockerfile` compila con Node y sirve con nginx. `nginx.conf.template` reenvía `/api/*` al gateway
indicado en `API_GATEWAY_URL` (por defecto `http://api-gateway:8090`, el nombre del servicio en docker-compose).
