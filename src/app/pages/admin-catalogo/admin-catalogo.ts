import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { Categoria, Servicio, ServicioRequest } from '../../core/models';
import { CatalogoService } from '../../core/services/catalogo.service';
import { NotificadorService } from '../../core/notificador.service';
import { Modal } from '../../shared/modal';

/** Mantenimiento del catálogo (ADMIN): categorías y servicios de impresión. */
@Component({
  selector: 'app-admin-catalogo',
  imports: [CurrencyPipe, FormsModule, Modal],
  templateUrl: './admin-catalogo.html',
})
export class AdminCatalogo implements OnInit {
  private readonly catalogo = inject(CatalogoService);
  private readonly notificador = inject(NotificadorService);

  protected readonly pestana = signal<'servicios' | 'categorias'>('servicios');
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly trabajando = signal(false);

  protected readonly modal = signal<'servicio' | 'categoria' | null>(null);
  protected editandoId: number | null = null;
  protected formServicio: ServicioRequest = this.servicioVacio();
  protected formCategoria = { nombre: '', descripcion: '' };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    forkJoin({ categorias: this.catalogo.categorias(), servicios: this.catalogo.servicios() }).subscribe({
      next: ({ categorias, servicios }) => {
        this.categorias.set(categorias);
        this.servicios.set(servicios);
      },
      error: (err) => this.notificador.error(err, 'No se pudo cargar el catálogo'),
    });
  }

  nuevoServicio(): void {
    this.editandoId = null;
    this.formServicio = this.servicioVacio();
    this.modal.set('servicio');
  }

  editarServicio(s: Servicio): void {
    this.editandoId = s.idservicio;
    this.formServicio = {
      nombre: s.nombre, descripcion: s.descripcion ?? '', precioBase: s.precioBase,
      requiereCotizacion: s.requiereCotizacion, idcategoria: s.idcategoria, activo: s.activo,
    };
    this.modal.set('servicio');
  }

  guardarServicio(): void {
    this.ejecutar(
      this.catalogo.guardarServicio(this.formServicio, this.editandoId ?? undefined),
      this.editandoId ? 'Servicio actualizado' : 'Servicio creado',
    );
  }

  eliminarServicio(s: Servicio): void {
    if (!confirm(`¿Eliminar el servicio "${s.nombre}"?`)) return;
    this.ejecutar(this.catalogo.eliminarServicio(s.idservicio), 'Servicio eliminado');
  }

  nuevaCategoria(): void {
    this.editandoId = null;
    this.formCategoria = { nombre: '', descripcion: '' };
    this.modal.set('categoria');
  }

  editarCategoria(c: Categoria): void {
    this.editandoId = c.idcategoria;
    this.formCategoria = { nombre: c.nombre, descripcion: c.descripcion ?? '' };
    this.modal.set('categoria');
  }

  guardarCategoria(): void {
    this.ejecutar(
      this.catalogo.guardarCategoria(this.formCategoria, this.editandoId ?? undefined),
      this.editandoId ? 'Categoría actualizada' : 'Categoría creada',
    );
  }

  eliminarCategoria(c: Categoria): void {
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    this.ejecutar(this.catalogo.eliminarCategoria(c.idcategoria), 'Categoría eliminada');
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

  private servicioVacio(): ServicioRequest {
    return { nombre: '', descripcion: '', precioBase: 0, requiereCotizacion: false, idcategoria: null as unknown as number, activo: true };
  }
}
