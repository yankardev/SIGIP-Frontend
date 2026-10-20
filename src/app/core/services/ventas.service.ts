import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EstadoPedido, Pago, PagoRequest, Pedido, PedidoRequest } from '../models';

/** sales-service: pedidos, flujo de estados y pagos. */
@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/sales-service/api/v1`;

  pedidos(estado?: EstadoPedido | '') {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;
    return this.http.get<Pedido[]>(`${this.url}/pedidos`, { params });
  }
  pedido(id: number) {
    return this.http.get<Pedido>(`${this.url}/pedidos/${id}`);
  }
  registrar(datos: PedidoRequest) {
    return this.http.post<Pedido>(`${this.url}/pedidos`, datos);
  }
  actualizar(id: number, datos: PedidoRequest) {
    return this.http.put<Pedido>(`${this.url}/pedidos/${id}`, datos);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`${this.url}/pedidos/${id}`);
  }
  cambiarEstado(id: number, estado: EstadoPedido, observacion: string) {
    return this.http.patch<Pedido>(`${this.url}/pedidos/${id}/estado`, { estado, observacion });
  }
  cancelar(id: number) {
    return this.http.post<Pedido>(`${this.url}/pedidos/${id}/cancelacion`, {});
  }

  pagos(idpedido: number) {
    return this.http.get<Pago[]>(`${this.url}/pedidos/${idpedido}/pagos`);
  }
  registrarPago(idpedido: number, datos: PagoRequest) {
    return this.http.post<Pago>(`${this.url}/pedidos/${idpedido}/pagos`, datos);
  }
  verificarPago(idpago: number, aprobado: boolean, observacion: string) {
    return this.http.post<Pago>(`${this.url}/pagos/${idpago}/verificacion`, { aprobado, observacion });
  }
}
