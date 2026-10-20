import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notificacion, NotificacionRequest } from '../models';

/** notification-service: avisos generados por los eventos de RabbitMQ y avisos manuales. */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/notification-service/api/v1/notificaciones`;

  /** Contador para la campana del menú superior. */
  readonly noLeidas = signal(0);

  listar() {
    return this.http.get<Notificacion[]>(this.url);
  }
  actualizarContador() {
    this.http.get<{ noLeidas: number }>(`${this.url}/no-leidas`).subscribe({
      next: (r) => this.noLeidas.set(r.noLeidas),
      error: () => this.noLeidas.set(0),
    });
  }
  marcarLeida(id: number) {
    return this.http.patch<Notificacion>(`${this.url}/${id}/leida`, {}).pipe(tap(() => this.actualizarContador()));
  }
  crear(datos: NotificacionRequest) {
    return this.http.post<Notificacion>(this.url, datos);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
