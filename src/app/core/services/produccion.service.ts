import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EstadoOrden, Orden, OrdenRequest } from '../models';

/** production-service: órdenes de producción, cola por prioridad y control de calidad. */
@Injectable({ providedIn: 'root' })
export class ProduccionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/production-service/api/v1/ordenes-produccion`;

  listar(estado?: EstadoOrden | '') {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;
    return this.http.get<Orden[]>(this.url, { params });
  }
  registrar(datos: OrdenRequest) {
    return this.http.post<Orden>(this.url, datos);
  }
  actualizar(id: number, datos: OrdenRequest) {
    return this.http.put<Orden>(`${this.url}/${id}`, datos);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  iniciar(id: number) {
    return this.http.post<Orden>(`${this.url}/${id}/inicio`, {});
  }
  calidad(id: number, aprobado: boolean, observacion: string) {
    return this.http.post<Orden>(`${this.url}/${id}/calidad`, { aprobado, observacion });
  }
}
