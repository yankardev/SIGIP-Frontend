import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models';

export interface ClienteRequest {
  nomusuario: string;
  email: string;
  password?: string;
  nombres: string;
  apellidos: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth-service/api/v1/clientes`;

  listar() { return this.http.get<Usuario[]>(this.url); }
  guardar(datos: ClienteRequest, id?: number) {
    return id ? this.http.put<Usuario>(`${this.url}/${id}`, datos) : this.http.post<Usuario>(this.url, datos);
  }
  eliminar(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}
