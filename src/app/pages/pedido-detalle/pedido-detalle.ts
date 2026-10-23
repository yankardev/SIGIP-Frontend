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

@Component({
  selector: 'app-pedido-detalle',
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, EstadoBadge, EtiquetaPipe, Modal],
  templateUrl: './pedido-detalle.html',
})
export class PedidoDetalle implements OnInit {
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

  protected readonly pasos: EstadoPedido[] = ESTADOS_PEDIDO.filter((e) => e !== 'CANCELADO');
  protected readonly indiceActual = computed(() => {
    const estado = this.pedido()?.estado;
    return estado ? this.pasos.indexOf(estado) : -1;
  });
  protected readonly esComercial = computed(() => this.auth.esAdmin() || this.auth.tieneRol('VENTAS'));
  protected readonly esOperativo = computed(() => this.auth.esAdmin() || this.auth.tieneRol('OPERACIONES'));
  protected readonly editable = computed(() => this.esComercial() && this.pedido()?.estado === 'REGISTRADO');
  protected readonly cancelable = computed(() => this.esComercial() && (this.pedido()?.siguientesEstados.includes('CANCELADO') ?? false));

  protected readonly modal = signal<'pago' | 'editar' | 'verificar' | null>(null);
  protected pago = { monto: 0, metodo: 'YAPE' as MetodoPago, numeroOperacion: '' };
  protected edicion = { cantidad: 1, especificaciones: '', fechaEntrega: '' };
  protected verificacion = { pago: null as Pago | null, observacion: '' };

  ngOnInit(): void { this.cargar(); }

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
    if (this.esOperativo()) {
      this.disenos.listar(id).subscribe({ next: (l) => this.listaDisenos.set(l), error: () => this.listaDisenos.set([]) });
    } else {
      this.listaDisenos.set([]);
    }
  }

  abrirPago(): void {
    this.pago = { monto: this.pedido()?.total ?? 0, metodo: 'YAPE', numeroOperacion: '' };
    this.modal.set('pago');
  }

  abrirEdicion(): void {
    const p = this.pedido();
    this.edicion = {
      cantidad: p?.cantidad ?? 1,
      especificaciones: p?.especificaciones ?? '',
      fechaEntrega: p?.fechaEntrega?.slice(0, 10) ?? '',
    };
    this.modal.set('editar');
  }

  abrirVerificacion(pago: Pago): void {
    this.verificacion = { pago, observacion: '' };
    this.modal.set('verificar');
  }

  registrarPago(): void {
    this.ejecutar(this.ventas.registrarPago(Number(this.id()), this.pago), 'Pago registrado: pendiente de verificación');
  }

  guardarEdicion(): void {
    const p = this.pedido()!;
    if (!p.idcliente) {
      this.notificador.error(null, 'Este pedido antiguo no tiene cliente comercial asociado');
      return;
    }
    this.ejecutar(this.ventas.actualizar(p.idpedido, {
      idcliente: p.idcliente,
      idservicio: p.idservicio,
      cantidad: this.edicion.cantidad,
      especificaciones: this.edicion.especificaciones,
      fechaEntrega: this.edicion.fechaEntrega ? `${this.edicion.fechaEntrega}T18:00:00` : null,
    }), 'Pedido actualizado');
  }

  verificar(aprobado: boolean): void {
    const pago = this.verificacion.pago;
    if (!pago) return;
    this.ejecutar(
      this.ventas.verificarPago(pago.idpago, aprobado, this.verificacion.observacion),
      aprobado ? 'Pago verificado: el pedido quedó confirmado para Operaciones' : 'Pago rechazado',
    );
  }

  entregar(): void {
    if (!confirm('¿Confirmar que el trabajo fue entregado al cliente?')) return;
    this.ejecutar(this.ventas.entregar(Number(this.id())), 'Entrega registrada. Proceso del pedido completado.');
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
