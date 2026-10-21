// En desarrollo, Angular reenvía /api al Gateway local mediante proxy.conf.json.
// Esto evita depender de CORS en el navegador y mantiene el mismo prefijo de API.
export const environment = {
  production: false,
  apiUrl: '/api',
};
