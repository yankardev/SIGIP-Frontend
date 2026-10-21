# SIGIP · Frontend Angular

Interfaz web de SIGIP para clientes y personal interno. Consume los microservicios a través del API Gateway; no debe llamar directamente a las bases de datos ni a los puertos privados de los microservicios.

## Requisitos

- Node.js compatible con Angular 21 (se recomienda Node.js 22 LTS).
- npm incluido con Node.js.
- MySQL y microservicios iniciados localmente.
- Discovery Server/Eureka en `http://localhost:9001`.
- API Gateway disponible en `http://localhost:9002`.

## Ejecutar en desarrollo (Windows / PowerShell)

Desde la carpeta del repositorio:

```powershell
npm ci
npm start
```

Abrir `http://localhost:4200`.

El comando de inicio utiliza `proxy.conf.json`: las peticiones del navegador bajo `/api` se reenvían a `http://localhost:9002`. Así, el frontend no necesita exponer los puertos internos de los servicios ni depender de CORS en desarrollo. Si se cambia el puerto del Gateway, actualizar el destino del proxy.

## Compilar y probar

```powershell
npm run build
npm test
```

No se debe considerar la aplicación validada hasta que estos comandos terminen sin errores en el equipo donde se ejecuta el backend. Las pruebas de interfaz no sustituyen la comprobación de los endpoints y de la persistencia en MySQL.

## Módulos de la interfaz

- Acceso con usuario y contraseña y sesión JWT.
- Registro de clientes.
- Catálogo de servicios y categorías.
- Pedidos, detalle y estados.
- Registro y verificación de pagos.
- Diseños y aprobaciones.
- Producción.
- Inventario y movimientos.
- Notificaciones.
- Reportes y dashboard.
- Administración de usuarios y roles.

Las pantallas protegidas usan guards del frontend para navegación; los permisos definitivos siempre deben validarse en el backend. El acceso al portal y las acciones disponibles dependen del rol devuelto por Auth Service.

## Contratos de API

En desarrollo, `environment.development.ts` usa `/api` y el proxy envía las solicitudes al Gateway. En producción, `environment.ts` conserva el prefijo `/api`, que debe ser atendido por el proxy inverso (Nginx u otra infraestructura).

El servicio de autenticación utiliza `/api/v1/auth/login` y `/api/v1/auth/registro` bajo la ruta del servicio publicada por el Gateway. Los demás módulos consumen sus servicios mediante las clases de `src/app/core/services`. Los paths finales deben mantenerse alineados con las rutas configuradas en SIGIP-Api-Gateway.

## Seguridad

- No guardar contraseñas en el navegador ni incluir credenciales reales en el repositorio.
- No tratar los datos de la interfaz como autorización; el backend debe comprobar identidad, rol y propiedad de cada recurso.
- No registrar tokens ni enviarlos a dominios externos.
- El administrador inicial se configura en Auth Service mediante sus variables de entorno; no se fija una contraseña en el frontend.

## Docker

El `Dockerfile` construye Angular y sirve los archivos estáticos con Nginx. El proxy de producción debe reenviar `/api/*` al API Gateway dentro de la red de despliegue. En Docker no se debe usar `localhost:9002` desde el navegador como dirección de un contenedor remoto.
