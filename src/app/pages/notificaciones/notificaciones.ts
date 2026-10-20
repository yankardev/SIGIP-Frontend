import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CANALES, Notificacion, NotificacionRequest } from '../../core/models';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { NotificadorService } from '../../core/notificador.service';
import { EstadoBadge } from '../../shared/estado-badge';
import { EtiquetaPipe } from '../../shared/etiqueta.pipe';
import { Modal } from '../../shared/modal';

/** Bandeja de avisos. Los genera notification-service al consumir los eventos de pedidos (RabbitMQ). */
@Component({
  selector: 'app-notificaciones',
  imports: [DatePipe, FormsModule, RouterLink, EstadoBadge, EtiquetaPipe, Modal],
  templateUrl: './notificaciones.html',
})
export class Notificaciones implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(NotificacionesService);
  private readonly notificador = inject(NotificadorService);

  protected readonly canales = CANALES;
  protected readonly lista = signal<Notificacion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly trabajando = signal(false);
  protected readonly modal = signal(false);
  protected form: NotificacionRequest = this.vacio();

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (l) => {
        this.lista.set(l);
        this.cargando.set(false);
        this.servicio.actualizarContador();
      },
      error: (err) => {
        this.cargando.set(false);
        this.notificador.error(err, 'No se pudieron cargar las notificaciones');
      },
    });
  }

  marcarLeida(n: Notificacion): void {
    this.servicio.marcarLeida(n.idnotificacion).subscribe({
      next: (actualizada) => this.lista.update((l) => l.map((x) => (x.idnotificacion === actualizada.idnotificacion ? actualizada : x))),
      error: (err) => this.notificador.error(err),
    });
  }

  nueva(): void {
    this.form = this.vacio();
    this.modal.set(true);
  }

  crear(): void {
    this.trabajando.set(true);
    this.servicio.crear({ ...this.form, idpedido: this.form.idpedido || null }).subscribe({
      next: () => {
        this.trabajando.set(false);
        this.modal.set(false);
        this.notificador.ok('Aviso enviado');
        this.cargar();
      },
      error: (err) => {
        this.trabajando.set(false);
        this.notificador.error(err);
      },
    });
  }

  eliminar(n: Notificacion): void {
    if (!confirm('¿Eliminar este aviso?')) return;
    this.servicio.eliminar(n.idnotificacion).subscribe({
      next: () => {
        this.notificador.ok('Aviso eliminado');
        this.cargar();
      },
      error: (err) => this.notificador.error(err),
    });
  }

  private vacio(): NotificacionRequest {
    return { destinatario: '', canal: 'SISTEMA', asunto: '', mensaje: '', idpedido: null };
  }
}
