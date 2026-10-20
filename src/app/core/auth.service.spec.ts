import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { LoginResponse } from './models';

/** Crea un JWT de prueba (sin firma válida) con la expiración indicada. */
function jwt(expSegundos: number): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '');
  return `${b64({ alg: 'HS256' })}.${b64({ sub: 'admin', exp: expSegundos })}.firma`;
}

const respuestaLogin = (token: string): LoginResponse => ({
  token,
  tipo: 'Bearer',
  usuario: { idusuario: 1, nomusuario: 'admin', email: 'a@b.pe', nombres: 'Admin', apellidos: 'SIGIP', activo: true, roles: ['ADMIN'] },
});

describe('AuthService e interceptor', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'login', children: [] }]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('guarda el token y el rol al iniciar sesión', () => {
    const token = jwt(Date.now() / 1000 + 3600);
    auth.login('admin', 'Admin12345').subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/auth-service/api/v1/auth/login'));
    expect(req.request.body).toEqual({ nomusuario: 'admin', password: 'Admin12345' });
    req.flush(respuestaLogin(token));

    expect(auth.autenticado()).toBe(true);
    expect(auth.esAdmin()).toBe(true);
    expect(auth.token()).toBe(token);
  });

  it('agrega el encabezado Authorization a las peticiones', () => {
    localStorage.setItem('sigip.token', jwt(Date.now() / 1000 + 3600));
    TestBed.inject(HttpClient).get('/api/catalog-service/api/v1/servicios').subscribe();

    const req = http.expectOne('/api/catalog-service/api/v1/servicios');
    expect(req.request.headers.get('Authorization')).toMatch(/^Bearer /);
    req.flush([]);
  });

  it('ignora un token vencido', () => {
    localStorage.setItem('sigip.token', jwt(Date.now() / 1000 - 60));
    expect(auth.token()).toBeNull();
  });

  it('cierra la sesión cuando el backend responde 401', () => {
    localStorage.setItem('sigip.token', jwt(Date.now() / 1000 + 3600));
    TestBed.inject(HttpClient).get('/api/sales-service/api/v1/pedidos').subscribe({ error: () => undefined });

    http.expectOne('/api/sales-service/api/v1/pedidos').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(localStorage.getItem('sigip.token')).toBeNull();
    expect(auth.autenticado()).toBe(false);
  });
});
