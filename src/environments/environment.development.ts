// Desarrollo con ng serve: el navegador llama al API Gateway en el puerto 9002.
// El Gateway debe permitir CORS para http://localhost:4200.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:9002',
};
