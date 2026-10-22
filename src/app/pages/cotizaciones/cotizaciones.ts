import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { Cotizacion, ESTADOS_COTIZACION, EstadoCotizacion } from '../../core/models';
import { VentasService } from '../../core/services/ventas.service';
import { NotificadorService } from '../../core/notificador.service';
import { Modal } from '../../shared/modal';
import { EstadoBadge } from '../../shared/estado-badge';
import { EtiquetaPipe } from '../../shared/etiqueta.pipe';

@Component({
  selector: 'app-cotizaciones',
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, Modal, EstadoBadge, EtiquetaPipe],
  templateUrl: './cotizaciones.html',
})
export class Cotizaciones implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly ventas = inject(VentasService);
  private readonly notificador = inject(NotificadorService);

  protected readonly estados = ESTADOS_COTIZACION;
  protected readonly lista = signal<Cotizacion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly trabajando = signal(false);
  protected filtro: EstadoCotizacion | '' = '';
  protected readonly modal = signal<'precio' | null>(null);
  protected seleccionada: Cotizacion | null = null;
  protected precioUnitario = 0;
  protected observacion = '';

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.ventas.cotizaciones(this.filtro).subscribe({
      next: (l) => { this.lista.set(l); this.cargando.set(false); },
      error: (e) => { this.cargando.set(false); this.notificador.error(e, 'No se pudieron cargar las cotizaciones'); },
    });
  }

  abrirPrecio(c: Cotizacion): void {
    this.seleccionada = c;
    this.precioUnitario = c.precioUnitario ?? 0;
    this.observacion = c.observacion ?? '';
    this.modal.set('precio');
  }

  guardarPrecio(): void {
    if (!this.seleccionada || this.precioUnitario <= 0) return;
    this.ejecutar(this.ventas.cotizar(this.seleccionada.idcotizacion, this.precioUnitario, this.observacion), 'Cotización enviada al cliente');
  }

  decidir(c: Cotizacion, aceptada: boolean): void {
    const texto = aceptada ? 'aceptar esta cotización y generar el pedido' : 'rechazar esta cotización';
    if (!confirm(`¿Deseas ${texto}?`)) return;
    this.ejecutar(this.ventas.decidirCotizacion(c.idcotizacion, aceptada), aceptada ? 'Cotización aceptada: pedido generado' : 'Cotización rechazada');
  }

  eliminar(c: Cotizacion): void {
    if (!confirm(`¿Eliminar la cotización #${c.idcotizacion}?`)) return;
    this.ejecutar(this.ventas.eliminarCotizacion(c.idcotizacion), 'Cotización eliminada');
  }

  private ejecutar(peticion: Observable<unknown>, mensaje: string): void {
    this.trabajando.set(true);
    peticion.subscribe({
      next: () => { this.trabajando.set(false); this.modal.set(null); this.notificador.ok(mensaje); this.cargar(); },
      error: (e) => { this.trabajando.set(false); this.notificador.error(e); },
    });
  }
}
