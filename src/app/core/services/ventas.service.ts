import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Cliente, ClienteRequest, Cotizacion, CotizacionRequest, EstadoCotizacion, EstadoPedido,
  Pago, PagoRequest, Pedido, PedidoRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/sales-service/api/v1`;

  clientes(soloActivos = false) {
    const params = soloActivos ? new HttpParams().set('activos', true) : undefined;
    return this.http.get<Cliente[]>(`${this.url}/clientes`, { params });
  }
  cliente(id: number) { return this.http.get<Cliente>(`${this.url}/clientes/${id}`); }
  guardarCliente(datos: ClienteRequest, id?: number) {
    return id ? this.http.put<Cliente>(`${this.url}/clientes/${id}`, datos) : this.http.post<Cliente>(`${this.url}/clientes`, datos);
  }
  desactivarCliente(id: number) { return this.http.delete<void>(`${this.url}/clientes/${id}`); }

  cotizaciones(estado?: EstadoCotizacion | '', idcliente?: number) {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (idcliente) params = params.set('idcliente', idcliente);
    return this.http.get<Cotizacion[]>(`${this.url}/cotizaciones`, { params });
  }
  guardarCotizacion(datos: CotizacionRequest, id?: number) {
    return id ? this.http.put<Cotizacion>(`${this.url}/cotizaciones/${id}`, datos) : this.http.post<Cotizacion>(`${this.url}/cotizaciones`, datos);
  }
  aprobarCotizacion(id: number) { return this.http.post<Cotizacion>(`${this.url}/cotizaciones/${id}/aprobacion`, {}); }
  rechazarCotizacion(id: number) { return this.http.post<Cotizacion>(`${this.url}/cotizaciones/${id}/rechazo`, {}); }
  convertirCotizacion(id: number) { return this.http.post<Pedido>(`${this.url}/cotizaciones/${id}/conversion`, {}); }
  eliminarCotizacion(id: number) { return this.http.delete<void>(`${this.url}/cotizaciones/${id}`); }

  pedidos(estado?: EstadoPedido | '') {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;
    return this.http.get<Pedido[]>(`${this.url}/pedidos`, { params });
  }
  pedido(id: number) { return this.http.get<Pedido>(`${this.url}/pedidos/${id}`); }
  registrar(datos: PedidoRequest) { return this.http.post<Pedido>(`${this.url}/pedidos`, datos); }
  actualizar(id: number, datos: PedidoRequest) { return this.http.put<Pedido>(`${this.url}/pedidos/${id}`, datos); }
  eliminar(id: number) { return this.http.delete<void>(`${this.url}/pedidos/${id}`); }
  cambiarEstado(id: number, estado: EstadoPedido, observacion: string) {
    return this.http.patch<Pedido>(`${this.url}/pedidos/${id}/estado`, { estado, observacion });
  }
  cancelar(id: number) { return this.http.post<Pedido>(`${this.url}/pedidos/${id}/cancelacion`, {}); }
  entregar(id: number) { return this.http.post<Pedido>(`${this.url}/pedidos/${id}/entrega`, {}); }

  pagos(idpedido: number) { return this.http.get<Pago[]>(`${this.url}/pedidos/${idpedido}/pagos`); }
  registrarPago(idpedido: number, datos: PagoRequest) { return this.http.post<Pago>(`${this.url}/pedidos/${idpedido}/pagos`, datos); }
  verificarPago(idpago: number, aprobado: boolean, observacion: string) {
    return this.http.post<Pago>(`${this.url}/pagos/${idpago}/verificacion`, { aprobado, observacion });
  }
}
