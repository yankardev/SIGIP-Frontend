import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Categoria, Servicio, ServicioRequest } from '../models';

/** catalog-service: categorías y servicios de impresión. */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/catalog-service/api/v1`;

  categorias() {
    return this.http.get<Categoria[]>(`${this.url}/categorias`);
  }
  guardarCategoria(datos: { nombre: string; descripcion: string }, id?: number) {
    return id
      ? this.http.put<Categoria>(`${this.url}/categorias/${id}`, datos)
      : this.http.post<Categoria>(`${this.url}/categorias`, datos);
  }
  eliminarCategoria(id: number) {
    return this.http.delete<void>(`${this.url}/categorias/${id}`);
  }

  servicios() {
    return this.http.get<Servicio[]>(`${this.url}/servicios`);
  }
  serviciosActivos() {
    return this.http.get<Servicio[]>(`${this.url}/servicios/activos`);
  }
  servicio(id: number) {
    return this.http.get<Servicio>(`${this.url}/servicios/${id}`);
  }
  guardarServicio(datos: ServicioRequest, id?: number) {
    return id
      ? this.http.put<Servicio>(`${this.url}/servicios/${id}`, datos)
      : this.http.post<Servicio>(`${this.url}/servicios`, datos);
  }
  eliminarServicio(id: number) {
    return this.http.delete<void>(`${this.url}/servicios/${id}`);
  }
}
