import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { Diseno, ESTADOS_PEDIDO, EstadoPedido, METODOS_PAGO, MetodoPago, Pago, Pedido } from '../../core/models';
import { VentasService } from '../../core/services/ventas.service';
import { DisenoService } from '../../core/services/diseno.service';
import { NotificadorService } from '../../core/notificador.service';
import { EstadoBadge } from '../../shared/estado-badge';
import { EtiquetaPipe } from '../../shared/etiqueta.pipe';
import { Modal } from '../../shared/modal';

/** Ficha del pedido: avance, pagos, diseños y acciones según el rol y el estado. */
@Component({
  selector: 'app-pedido-detalle',
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, EstadoBadge, EtiquetaPipe, Modal],
  templateUrl: './pedido-detalle.html',
})
export class PedidoDetalle implements OnInit {
  /** Parámetro :id de la ruta (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly auth = inject(AuthService);
  private readonly ventas = inject(VentasService);
  private readonly disenos = inject(DisenoService);
  private readonly notificador = inject(NotificadorService);
  private readonly router = inject(Router);

  protected readonly metodos = METODOS_PAGO;
  protected readonly pedido = signal<Pedido | null>(null);
  protected readonly pagos = signal<Pago[]>([]);
  protected readonly listaDisenos = signal<Diseno[]>([]);
  protected readonly trabajando = signal(false);

  /** Recorrido normal del pedido para la barra de avance. */
  protected readonly pasos: EstadoPedido[] = ESTADOS_PEDIDO.filter((e) => e !== 'CANCELADO' && e !== 'EN_DISENO');
  protected readonly indiceActual = computed(() => {
    const estado = this.pedido()?.estado;
    if (estado === 'EN_DISENO') return this.pasos.indexOf('CONFIRMADO');
    return estado ? this.pasos.indexOf(estado) : -1;
  });
  protected readonly editable = computed(() => this.pedido()?.estado === 'REGISTRADO');
  protected readonly cancelable = computed(() => this.pedido()?.siguientesEstados.includes('CANCELADO') ?? false);

  // Formularios
  protected readonly modal = signal<'pago' | 'editar' | 'estado' | 'verificar' | null>(null);
  protected pago = { monto: 0, metodo: 'YAPE' as MetodoPago, numeroOperacion: '' };
  protected edicion = { cantidad: 1, especificaciones: '' };
  protected cambio = { estado: '' as EstadoPedido | '', observacion: '' };
  protected verificacion = { pago: null as Pago | null, observacion: '' };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const id = Number(this.id());
    this.ventas.pedido(id).subscribe({
      next: (p) => this.pedido.set(p),
      error: (err) => {
        this.notificador.error(err, 'No se encontró el pedido');
        this.router.navigate(['/pedidos']);
      },
    });
    this.ventas.pagos(id).subscribe({ next: (l) => this.pagos.set(l), error: () => this.pagos.set([]) });
    this.disenos.listar(id).subscribe({ next: (l) => this.listaDisenos.set(l), error: () => this.listaDisenos.set([]) });
  }

  abrirPago(): void {
    this.pago = { monto: this.pedido()?.total ?? 0, metodo: 'YAPE', numeroOperacion: '' };
    this.modal.set('pago');
  }
  abrirEdicion(): void {
    const p = this.pedido();
    this.edicion = { cantidad: p?.cantidad ?? 1, especificaciones: p?.especificaciones ?? '' };
    this.modal.set('editar');
  }
  abrirCambioEstado(): void {
    this.cambio = { estado: this.pedido()?.siguientesEstados.find((e) => e !== 'CANCELADO') ?? '', observacion: '' };
    this.modal.set('estado');
  }
  abrirVerificacion(pago: Pago): void {
    this.verificacion = { pago, observacion: '' };
    this.modal.set('verificar');
  }

  registrarPago(): void {
    this.ejecutar(this.ventas.registrarPago(Number(this.id()), this.pago), 'Pago registrado: queda pendiente de verificación');
  }

  guardarEdicion(): void {
    const p = this.pedido()!;
    this.ejecutar(
      this.ventas.actualizar(p.idpedido, { idservicio: p.idservicio, ...this.edicion }),
      'Pedido actualizado',
    );
  }

  cambiarEstado(): void {
    if (!this.cambio.estado) return;
    this.ejecutar(
      this.ventas.cambiarEstado(Number(this.id()), this.cambio.estado, this.cambio.observacion),
      'Estado actualizado',
    );
  }

  verificar(aprobado: boolean): void {
    const pago = this.verificacion.pago;
    if (!pago) return;
    this.ejecutar(
      this.ventas.verificarPago(pago.idpago, aprobado, this.verificacion.observacion),
      aprobado ? 'Pago verificado: el pedido quedó confirmado' : 'Pago rechazado',
    );
  }

  cancelar(): void {
    if (!confirm('¿Seguro que deseas cancelar este pedido?')) return;
    this.ejecutar(this.ventas.cancelar(Number(this.id())), 'Pedido cancelado');
  }

  eliminar(): void {
    if (!confirm('¿Eliminar definitivamente este pedido?')) return;
    this.trabajando.set(true);
    this.ventas.eliminar(Number(this.id())).subscribe({
      next: () => {
        this.notificador.ok('Pedido eliminado');
        this.router.navigate(['/pedidos']);
      },
      error: (err) => {
        this.trabajando.set(false);
        this.notificador.error(err);
      },
    });
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
