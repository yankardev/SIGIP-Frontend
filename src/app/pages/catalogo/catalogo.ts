import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Categoria, Cliente, Servicio, ServicioOpcion } from '../../core/models';
import { CatalogoService } from '../../core/services/catalogo.service';
import { VentasService } from '../../core/services/ventas.service';
import { NotificadorService } from '../../core/notificador.service';
import { Modal } from '../../shared/modal';

interface GrupoOpciones {
  grupo: string;
  opciones: ServicioOpcion[];
}

/** Nuevo pedido: precio fijo o cálculo rápido según opciones del servicio. */
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
  protected readonly opciones = signal<ServicioOpcion[]>([]);
  protected readonly cargandoOpciones = signal(false);
  protected selecciones: Record<string, number> = {};
  protected idcliente = 0;
  protected cantidad = 1;
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
      this.notificador.ok('Este trabajo requiere una cotización manual.');
      return;
    }
    if (this.clientes().length === 0) {
      this.router.navigate(['/clientes']);
      this.notificador.error(null, 'Registra al menos un cliente antes de crear un pedido');
      return;
    }

    this.idcliente = this.clientes()[0]?.idcliente ?? 0;
    this.cantidad = 1;
    this.especificaciones = '';
    this.fechaEntrega = '';
    this.opciones.set([]);
    this.selecciones = {};
    this.elegido.set(servicio);

    if (!servicio.personalizable) return;
    this.cargandoOpciones.set(true);
    this.catalogo.opciones(servicio.idservicio).subscribe({
      next: (lista) => {
        this.opciones.set(lista);
        for (const grupo of this.gruposOpciones()) {
          if (grupo.opciones.length) this.selecciones[grupo.grupo] = grupo.opciones[0].idopcion;
        }
        this.cargandoOpciones.set(false);
      },
      error: (err) => {
        this.cargandoOpciones.set(false);
        this.elegido.set(null);
        this.notificador.error(err, 'No se pudieron cargar las opciones del servicio');
      },
    });
  }

  gruposOpciones(): GrupoOpciones[] {
    const grupos = new Map<string, ServicioOpcion[]>();
    for (const opcion of this.opciones()) {
      const lista = grupos.get(opcion.grupo) ?? [];
      lista.push(opcion);
      grupos.set(opcion.grupo, lista);
    }
    return Array.from(grupos.entries()).map(([grupo, opciones]) => ({ grupo, opciones }));
  }

  opcionSeleccionada(grupo: string): ServicioOpcion | undefined {
    const id = Number(this.selecciones[grupo]);
    return this.opciones().find((o) => o.idopcion === id);
  }

  adicionalUnitario(): number {
    return this.gruposOpciones().reduce((total, grupo) => total + (this.opcionSeleccionada(grupo.grupo)?.incremento ?? 0), 0);
  }

  precioUnitario(): number {
    return (this.elegido()?.precioBase ?? 0) + this.adicionalUnitario();
  }

  total(): number {
    return this.precioUnitario() * (this.cantidad || 0);
  }

  opcionesCompletas(): boolean {
    const servicio = this.elegido();
    if (!servicio?.personalizable) return true;
    const grupos = this.gruposOpciones();
    return grupos.length > 0 && grupos.every((g) => !!this.selecciones[g.grupo]);
  }

  opcionesSeleccionadas(): number[] {
    return this.gruposOpciones()
      .map((g) => Number(this.selecciones[g.grupo]))
      .filter((id) => Number.isInteger(id) && id > 0);
  }

  detallePrecio(): string | null {
    const servicio = this.elegido();
    if (!servicio?.personalizable) return null;
    const partes = [`Precio base S/ ${servicio.precioBase.toFixed(2)}`];
    for (const grupo of this.gruposOpciones()) {
      const opcion = this.opcionSeleccionada(grupo.grupo);
      if (opcion) partes.push(`${grupo.grupo}: ${opcion.nombre} (+S/ ${opcion.incremento.toFixed(2)})`);
    }
    partes.push(`Precio unitario final S/ ${this.precioUnitario().toFixed(2)}`);
    return partes.join(' | ');
  }

  imagen(servicio: Servicio): string {
    return servicio.imagenUrl || '/assets/servicios/default.svg';
  }

  imagenError(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    if (!img.src.endsWith('/assets/servicios/default.svg')) img.src = '/assets/servicios/default.svg';
  }

  cerrar(): void {
    this.elegido.set(null);
    this.opciones.set([]);
    this.selecciones = {};
  }

  solicitar(): void {
    const servicio = this.elegido();
    if (!servicio || !this.idcliente || !this.cantidad || this.cantidad < 1 || !this.opcionesCompletas()) return;
    this.guardando.set(true);
    this.ventas.registrar({
      idcliente: this.idcliente,
      idservicio: servicio.idservicio,
      cantidad: this.cantidad,
      especificaciones: this.especificaciones,
      fechaEntrega: this.fechaEntrega ? `${this.fechaEntrega}T18:00:00` : null,
      opcionesSeleccionadas: servicio.personalizable ? this.opcionesSeleccionadas() : null,
      // Se muestran para el usuario, pero el backend vuelve a calcular el precio usando los IDs anteriores.
      precioUnitarioAcordado: servicio.personalizable ? Number(this.precioUnitario().toFixed(2)) : null,
      detallePrecio: this.detallePrecio(),
    }).subscribe({
      next: (pedido) => {
        this.guardando.set(false);
        this.cerrar();
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
