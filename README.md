# SIGIP · Frontend Angular

Interfaz web de SIGIP para clientes y personal administrativo. Implementa los módulos de catálogo, pedidos y pagos, diseños, producción, inventario, usuarios y notificaciones. Consume el backend a través del API Gateway.

## Requisitos

- Node.js 22 o 24.
- API Gateway disponible en el puerto **9002** y microservicios registrados en Eureka.
- Para ejecutar todo el sistema con Docker, utiliza el archivo Compose de la raíz del proyecto.

## Comandos de desarrollo

```bash
npm install
npm start
# Frontend: http://localhost:4200
# API Gateway: http://localhost:9002
npm test
npm run build
```

## Acceso

- El administrador inicial se configura en el servicio de autenticación mediante variables de entorno.
- Los clientes pueden registrarse desde la pantalla «Crea tu cuenta».
- No se deben publicar contraseñas reales ni credenciales de producción en este repositorio.

## Docker

El `Dockerfile` compila Angular y sirve los archivos estáticos mediante Nginx. Nginx reenvía las solicitudes `/api/*` al Gateway indicado por `API_GATEWAY_URL`, cuyo valor predeterminado es `http://api-gateway:9002` dentro de la red Docker.

En desarrollo, Angular utiliza `http://localhost:9002`. En Docker, el navegador usa el origen del frontend y Nginx enruta internamente al Gateway, evitando que el navegador necesite conocer los nombres internos de los contenedores.
