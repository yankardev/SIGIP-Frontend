import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse, Rol, Usuario, UsuarioRequest } from './models';

const CLAVE_TOKEN = 'sigip.token';
const CLAVE_USUARIO = 'sigip.usuario';

/** Sesión del usuario: login JWT contra auth-service y datos guardados en el navegador. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly url = `${environment.apiUrl}/auth-service/api/v1/auth`;

  private readonly usuarioActual = signal<Usuario | null>(this.leerUsuario());

  readonly usuario = this.usuarioActual.asReadonly();
  readonly autenticado = computed(() => this.usuarioActual() !== null && this.token() !== null);
  readonly esAdmin = computed(() => this.tieneRol('ADMIN'));

  login(nomusuario: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, { nomusuario, password }).pipe(
      tap((resp) => {
        localStorage.setItem(CLAVE_TOKEN, resp.token);
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(resp.usuario));
        this.usuarioActual.set(resp.usuario);
      }),
    );
  }

  registrar(datos: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.url}/registro`, datos);
  }

  logout(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  token(): string | null {
    const token = localStorage.getItem(CLAVE_TOKEN);
    return token && !this.expirado(token) ? token : null;
  }

  tieneRol(rol: Rol): boolean {
    return this.usuarioActual()?.roles.includes(rol) ?? false;
  }

  /** Lee la fecha de expiración (exp) del JWT sin validarlo: la firma la valida el backend. */
  private expirado(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private leerUsuario(): Usuario | null {
    try {
      const guardado = localStorage.getItem(CLAVE_USUARIO);
      return guardado ? (JSON.parse(guardado) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
