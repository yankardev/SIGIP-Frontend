import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { adminGuard, authGuard } from './guards';

function sesion(roles: string[]): void {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  localStorage.setItem('sigip.token', `${btoa('{}')}.${btoa(JSON.stringify({ exp }))}.x`);
  localStorage.setItem('sigip.usuario', JSON.stringify({ nomusuario: 'u', roles }));
}

describe('Guards de rutas', () => {
  const ejecutar = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() => guard({} as never, {} as never)) as boolean | UrlTree;

  beforeEach(() => localStorage.clear());

  const configurar = () =>
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });

  it('envía al login si no hay sesión', () => {
    configurar();
    const r = ejecutar(authGuard);
    expect(TestBed.inject(Router).serializeUrl(r as UrlTree)).toBe('/login');
  });

  it('deja pasar a un cliente autenticado pero no a pantallas de ADMIN', () => {
    sesion(['CLIENTE']);
    configurar();
    expect(ejecutar(authGuard)).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(ejecutar(adminGuard) as UrlTree)).toBe('/inicio');
  });

  it('permite al ADMIN entrar a sus pantallas', () => {
    sesion(['ADMIN']);
    configurar();
    expect(ejecutar(adminGuard)).toBe(true);
  });
});
