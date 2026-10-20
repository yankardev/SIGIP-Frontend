// Build de producción (Docker / nube): nginx sirve el frontend y reenvía /api al API Gateway.
export const environment = {
  production: true,
  apiUrl: '/api',
};
