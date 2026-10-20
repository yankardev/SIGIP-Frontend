import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Insumo, InsumoRequest, Movimiento, MovimientoRequest } from '../models';

/** inventory-service: insumos, stock mínimo y kárdex. */
@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/inventory-service/api/v1/insumos`;

  listar() {
    return this.http.get<Insumo[]>(this.url);
  }
  bajoStock() {
    return this.http.get<Insumo[]>(`${this.url}/bajo-stock`);
  }
  guardar(datos: InsumoRequest, id?: number) {
    return id ? this.http.put<Insumo>(`${this.url}/${id}`, datos) : this.http.post<Insumo>(this.url, datos);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  kardex(id: number) {
    return this.http.get<Movimiento[]>(`${this.url}/${id}/movimientos`);
  }
  registrarMovimiento(id: number, datos: MovimientoRequest) {
    return this.http.post<Movimiento>(`${this.url}/${id}/movimientos`, datos);
  }
}
