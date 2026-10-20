import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ESTADOS_ORDEN, EstadoOrden, Orden, OrdenRequest, PRIORIDADES } from '../../core/models';
import { ProduccionService } from '../../core/services/produccion.service';
import { NotificadorService } from '../../core/notificador.service';
import { EstadoBadge } from '../../shared/estado-badge';
import { EtiquetaPipe } from '../../shared/etiqueta.pipe';
import { Modal } from '../../shared/modal';

/** Cola de producción ordenada por prioridad, con inicio de trabajo y control de calidad. */
@Component({
  selector: 'app-produccion',
  imports: [DatePipe, FormsModule, RouterLink, EstadoBadge, EtiquetaPipe, Modal],
  templateUrl: './produccion.html',
})
export class Produccion implements OnInit {
  /** ?pedido=ID: abre el formulario de nueva orden para ese pedido. */
  readonly pedido = input<string>();

  private readonly servicio = inject(ProduccionService);
  private readonly notificador = inject(NotificadorService);

  protected readonly estados = ESTADOS_ORDEN;
  protected readonly prioridades = PRIORIDADES;
  protected readonly ordenes = signal<Orden[]>([]);
  protected readonly cargando = signal(true);
  protected readonly trabajando = signal(false);
  protected filtro: EstadoOrden | '' = '';

  protected readonly modal = signal<'form' | 'calidad' | null>(null);
  protected editandoId: number | null = null;
  protected form: OrdenRequest = { idpedido: null as unknown as number, prioridad: 'MEDIA', responsable: '', observacion: '' };
  protected calidad = { orden: null as Orden | null, aprobado: true, observacion: '' };

  ngOnInit(): void {
    this.cargar();
    const p = Number(this.pedido());
    if (p > 0) {
      this.nueva(p);
    }
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar(this.filtro).subscribe({
      next: (l) => {
        this.ordenes.set(l);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.notificador.error(err, 'No se pudieron cargar las órdenes');
      },
    });
  }

  nueva(idpedido?: number): void {
    this.editandoId = null;
    this.form = { idpedido: idpedido ?? (null as unknown as number), prioridad: 'MEDIA', responsable: '', observacion: '' };
    this.modal.set('form');
  }

  editar(o: Orden): void {
    this.editandoId = o.idorden;
    this.form = { idpedido: o.idpedido, prioridad: o.prioridad, responsable: o.responsable ?? '', observacion: o.observacion ?? '' };
    this.modal.set('form');
  }

  guardar(): void {
    const peticion = this.editandoId ? this.servicio.actualizar(this.editandoId, this.form) : this.servicio.registrar(this.form);
    this.ejecutar(peticion, this.editandoId ? 'Orden actualizada' : 'Orden de producción creada');
  }

  iniciar(o: Orden): void {
    this.ejecutar(this.servicio.iniciar(o.idorden), `Orden #${o.idorden} en proceso: el pedido pasó a producción`);
  }

  abrirCalidad(o: Orden): void {
    this.calidad = { orden: o, aprobado: true, observacion: '' };
    this.modal.set('calidad');
  }

  registrarCalidad(): void {
    const o = this.calidad.orden;
    if (!o) return;
    this.ejecutar(
      this.servicio.calidad(o.idorden, this.calidad.aprobado, this.calidad.observacion),
      this.calidad.aprobado ? 'Calidad aprobada: el pedido quedó terminado' : 'Orden observada: requiere reproceso',
    );
  }

  eliminar(o: Orden): void {
    if (!confirm(`¿Eliminar la orden #${o.idorden}?`)) return;
    this.ejecutar(this.servicio.eliminar(o.idorden), 'Orden eliminada');
  }

  private ejecutar(peticion: Observable<unknown>, mensaje: string): void {
    this.trabajando.set(true);
    peticion.subscribe({
      next: () => {
        this.trabajando.set(false);
        this.modal.set(null);
        this.notificador.ok(mensaje);
        this.cargar();
      },
      error: (err) => {
        this.trabajando.set(false);
        this.notificador.error(err);
      },
    });
  }
}
