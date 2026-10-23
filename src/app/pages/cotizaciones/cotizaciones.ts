import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cliente, Cotizacion, CotizacionRequest, ESTADOS_COTIZACION, EstadoCotizacion, Servicio } from '../../core/models';
import { VentasService } from '../../core/services/ventas.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { NotificadorService } from '../../core/notificador.service';
import { EstadoBadge } from '../../shared/estado-badge';
import { EtiquetaPipe } from '../../shared/etiqueta.pipe';
import { Modal } from '../../shared/modal';

@Component({
  selector: 'app-cotizaciones',
  imports: [CurrencyPipe, DatePipe, FormsModule, EstadoBadge, EtiquetaPipe, Modal],
  templateUrl: './cotizaciones.html',
})
export class Cotizaciones implements OnInit {
  private readonly ventas = inject(VentasService);
  private readonly catalogo = inject(CatalogoService);
  private readonly notificador = inject(NotificadorService);
  private readonly router = inject(Router);

  protected readonly cotizaciones = signal<Cotizacion[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly modal = signal(false);
  protected readonly trabajando = signal(false);
  protected filtro: EstadoCotizacion | '' = '';
  protected editandoId: number | null = null;
  protected readonly estados = ESTADOS_COTIZACION;
  protected form: CotizacionRequest = this.vacio();

  ngOnInit(): void {
    this.ventas.clientes(true).subscribe(l => this.clientes.set(l));
    this.catalogo.serviciosActivos().subscribe(l => this.servicios.set(l));
    this.cargar();
  }

  cargar(): void {
    this.ventas.cotizaciones(this.filtro).subscribe({ next: l => this.cotizaciones.set(l), error: e => this.notificador.error(e, 'No se pudieron cargar las cotizaciones') });
  }

  nueva(): void { this.editandoId = null; this.form = this.vacio(); this.modal.set(true); }

  editar(c: Cotizacion): void {
    this.editandoId = c.idcotizacion;
    this.form = { idcliente: c.idcliente, idservicio: c.idservicio, cantidad: c.cantidad, precioUnitarioAcordado: c.precioUnitario, especificaciones: c.especificaciones ?? '', vigenciaHasta: c.vigenciaHasta };
    this.modal.set(true);
  }

  precioBase(): number {
    return this.servicios().find(s => s.idservicio === Number(this.form.idservicio))?.precioBase ?? 0;
  }

  totalEstimado(): number { return (this.form.precioUnitarioAcordado ?? this.precioBase()) * (this.form.cantidad || 0); }

  guardar(): void {
    this.trabajando.set(true);
    this.ventas.guardarCotizacion(this.form, this.editandoId ?? undefined).subscribe({
      next: () => { this.trabajando.set(false); this.modal.set(false); this.notificador.ok(this.editandoId ? 'Cotización actualizada' : 'Cotización creada'); this.cargar(); },
      error: e => { this.trabajando.set(false); this.notificador.error(e); },
    });
  }

  aprobar(c: Cotizacion): void { this.ventas.aprobarCotizacion(c.idcotizacion).subscribe({ next: () => { this.notificador.ok('Cotización aprobada'); this.cargar(); }, error: e => this.notificador.error(e) }); }
  rechazar(c: Cotizacion): void { this.ventas.rechazarCotizacion(c.idcotizacion).subscribe({ next: () => { this.notificador.ok('Cotización rechazada'); this.cargar(); }, error: e => this.notificador.error(e) }); }
  convertir(c: Cotizacion): void {
    this.ventas.convertirCotizacion(c.idcotizacion).subscribe({
      next: p => { this.notificador.ok(`Pedido #${p.idpedido} generado desde la cotización`); this.router.navigate(['/pedidos', p.idpedido]); },
      error: e => this.notificador.error(e),
    });
  }
  eliminar(c: Cotizacion): void {
    if (!confirm(`¿Eliminar la cotización #${c.idcotizacion}?`)) return;
    this.ventas.eliminarCotizacion(c.idcotizacion).subscribe({ next: () => this.cargar(), error: e => this.notificador.error(e) });
  }

  private vacio(): CotizacionRequest {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return { idcliente: 0, idservicio: 0, cantidad: 1, precioUnitarioAcordado: null, especificaciones: '', vigenciaHasta: d.toISOString().slice(0, 10) };
  }
}
