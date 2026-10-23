import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Categoria, Cliente, Servicio } from '../../core/models';
import { CatalogoService } from '../../core/services/catalogo.service';
import { VentasService } from '../../core/services/ventas.service';
import { NotificadorService } from '../../core/notificador.service';
import { Modal } from '../../shared/modal';

/** Catálogo interno: Ventas selecciona un cliente y convierte el servicio en pedido. */
@Component({
  selector: 'app-catalogo',
  imports: [CurrencyPipe, FormsModule, Modal],
  templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {
  private readonly catalogo = inject(CatalogoService);
  private readonly ventas = inject(VentasService);
  private readonly notificador = inject(NotificadorService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(true);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly categoriaSeleccionada = signal<number | null>(null);
  protected readonly busqueda = signal('');

  protected readonly visibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const cat = this.categoriaSeleccionada();
    return this.servicios().filter(
      (s) => (cat === null || s.idcategoria === cat) &&
        (!texto || s.nombre.toLowerCase().includes(texto) || (s.descripcion ?? '').toLowerCase().includes(texto)),
    );
  });

  protected readonly elegido = signal<Servicio | null>(null);
  protected idcliente = 0;
  protected cantidad = 100;
  protected especificaciones = '';
  protected fechaEntrega = '';
  protected readonly guardando = signal(false);

  ngOnInit(): void {
    forkJoin({
      categorias: this.catalogo.categorias(),
      servicios: this.catalogo.serviciosActivos(),
      clientes: this.ventas.clientes(true),
    }).subscribe({
      next: ({ categorias, servicios, clientes }) => {
        this.categorias.set(categorias.filter((c) => c.activo !== false));
        this.servicios.set(servicios);
        this.clientes.set(clientes);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.notificador.error(err, 'No se pudo cargar la información comercial');
      },
    });
  }

  abrir(servicio: Servicio): void {
    if (servicio.requiereCotizacion) {
      this.router.navigate(['/cotizaciones']);
      this.notificador.ok('Este servicio requiere cotización. Registra primero la propuesta comercial.');
      return;
    }
    if (this.clientes().length === 0) {
      this.router.navigate(['/clientes']);
      this.notificador.error(null, 'Registra al menos un cliente antes de crear un pedido');
      return;
    }
    this.idcliente = this.clientes()[0]?.idcliente ?? 0;
    this.cantidad = 100;
    this.especificaciones = '';
    this.fechaEntrega = '';
    this.elegido.set(servicio);
  }

  total(): number {
    return (this.elegido()?.precioBase ?? 0) * (this.cantidad || 0);
  }

  solicitar(): void {
    const servicio = this.elegido();
    if (!servicio || !this.idcliente || !this.cantidad || this.cantidad < 1) return;
    this.guardando.set(true);
    this.ventas.registrar({
      idcliente: this.idcliente,
      idservicio: servicio.idservicio,
      cantidad: this.cantidad,
      especificaciones: this.especificaciones,
      fechaEntrega: this.fechaEntrega ? `${this.fechaEntrega}T18:00:00` : null,
    }).subscribe({
      next: (pedido) => {
        this.guardando.set(false);
        this.elegido.set(null);
        this.notificador.ok(`Pedido #${pedido.idpedido} registrado para ${pedido.cliente}.`);
        this.router.navigate(['/pedidos', pedido.idpedido]);
      },
      error: (err) => {
        this.guardando.set(false);
        this.notificador.error(err);
      },
    });
  }
}
