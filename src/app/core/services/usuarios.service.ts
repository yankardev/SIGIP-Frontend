import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioRequest } from '../models';

/** auth-service: administración de usuarios y roles (solo ADMIN). */
@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth-service/api/v1/usuarios`;

  listar() {
    return this.http.get<Usuario[]>(this.url);
  }
  guardar(datos: UsuarioRequest, id?: number) {
    return id ? this.http.put<Usuario>(`${this.url}/${id}`, datos) : this.http.post<Usuario>(this.url, datos);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
