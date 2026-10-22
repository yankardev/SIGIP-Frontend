import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { Categoria, Servicio, Usuario } from '../../core/models';
import { CatalogoService } from '../../core/services/catalogo.service';
import { ClientesService } from '../../core/services/clientes.service';
import { VentasService } from '../../core/services/ventas.service';
import { NotificadorService } from '../../core/notificador.service';
import { Modal } from '../../shared/modal';

@Component({
  selector: 'app-catalogo',
  imports: [CurrencyPipe, FormsModule, Modal],
  templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly catalogo = inject(CatalogoService);
  private readonly clientesService = inject(ClientesService);
  private readonly ventas = inject(VentasService);
  private readonly notificador = inject(NotificadorService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(true);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly clientes = signal<Usuario[]>([]);
  protected readonly categoriaSeleccionada = signal<number | null>(null);
  protected readonly busqueda = signal('');

  protected readonly visibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const cat = this.categoriaSeleccionada();
    return this.servicios().filter((s) =>
      (cat === null || s.idcategoria === cat) &&
      (!texto || s.nombre.toLowerCase().includes(texto) || (s.descripcion ?? '').toLowerCase().includes(texto)),
    );
  });

  protected readonly elegido = signal<Servicio | null>(null);
  protected cliente = '';
  protected cantidad = 100;
  protected especificaciones = '';
  protected readonly guardando = signal(false);

  ngOnInit(): void {
    forkJoin({
      categorias: this.catalogo.categorias(),
      servicios: this.catalogo.serviciosActivos(),
      clientes: this.auth.esInterno() ? this.clientesService.listar() : of([] as Usuario[]),
    }).subscribe({
      next: ({ categorias, servicios, clientes }) => {
        this.categorias.set(categorias.filter((c) => c.activo !== false));
        this.servicios.set(servicios);
        this.clientes.set(clientes.filter((c) => c.activo));
        this.cargando.set(false);
      },
      error: (err) => { this.cargando.set(false); this.notificador.error(err, 'No se pudo cargar la información comercial'); },
    });
  }

  abrir(servicio: Servicio): void {
    this.cliente = this.clientes()[0]?.nomusuario ?? '';
    this.cantidad = 100;
    this.especificaciones = '';
    this.elegido.set(servicio);
  }

  total(): number { return (this.elegido()?.precioBase ?? 0) * (this.cantidad || 0); }

  solicitar(): void {
    const servicio = this.elegido();
    if (!servicio || !this.cantidad || this.cantidad < 1) return;
    if (this.auth.esInterno() && !this.cliente) {
      this.notificador.error(null, 'Selecciona el cliente');
      return;
    }

    this.guardando.set(true);
    const base = { idservicio: servicio.idservicio, cantidad: this.cantidad, especificaciones: this.especificaciones };
    const datos = this.auth.esInterno() ? { ...base, cliente: this.cliente } : base;
    const peticion = servicio.requiereCotizacion
      ? this.ventas.solicitarCotizacion(datos)
      : this.ventas.registrar(datos);

    peticion.subscribe({
      next: (resultado) => {
        this.guardando.set(false);
        this.elegido.set(null);
        if (servicio.requiereCotizacion) {
          this.notificador.ok('Solicitud de cotización registrada. El área comercial evaluará el precio.');
          this.router.navigate(['/cotizaciones']);
        } else {
          const pedido = resultado as { idpedido: number };
          this.notificador.ok(`Pedido #${pedido.idpedido} registrado. El siguiente paso es registrar el pago.`);
          this.router.navigate(['/pedidos', pedido.idpedido]);
        }
      },
      error: (err) => { this.guardando.set(false); this.notificador.error(err); },
    });
  }
}
