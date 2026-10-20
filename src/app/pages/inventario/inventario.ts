import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Insumo, InsumoRequest, Movimiento, MovimientoRequest } from '../../core/models';
import { InventarioService } from '../../core/services/inventario.service';
import { NotificadorService } from '../../core/notificador.service';
import { EstadoBadge } from '../../shared/estado-badge';
import { Modal } from '../../shared/modal';

/** Insumos, alertas de stock mínimo, entradas/salidas y kárdex. */
@Component({
  selector: 'app-inventario',
  imports: [DatePipe, DecimalPipe, FormsModule, EstadoBadge, Modal],
  templateUrl: './inventario.html',
})
export class Inventario implements OnInit {
  private readonly servicio = inject(InventarioService);
  private readonly notificador = inject(NotificadorService);

  protected readonly insumos = signal<Insumo[]>([]);
  protected readonly cargando = signal(true);
  protected readonly trabajando = signal(false);
  protected readonly soloBajoStock = signal(false);
  protected readonly visibles = computed(() => this.insumos().filter((i) => !this.soloBajoStock() || i.bajoStock));
  protected readonly criticos = computed(() => this.insumos().filter((i) => i.bajoStock).length);

  protected readonly modal = signal<'form' | 'movimiento' | 'kardex' | null>(null);
  protected editandoId: number | null = null;
  protected form: InsumoRequest = this.vacio();
  protected seleccionado: Insumo | null = null;
  protected movimiento: MovimientoRequest = { tipo: 'ENTRADA', cantidad: 1, motivo: '', idpedido: null };
  protected readonly kardex = signal<Movimiento[]>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (l) => {
        this.insumos.set(l);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.notificador.error(err, 'No se pudo cargar el inventario');
      },
    });
  }

  nuevo(): void {
    this.editandoId = null;
    this.form = this.vacio();
    this.modal.set('form');
  }

  editar(i: Insumo): void {
    this.editandoId = i.idinsumo;
    this.form = {
      codigo: i.codigo, nombre: i.nombre, unidadMedida: i.unidadMedida,
      stockActual: i.stockActual, stockMinimo: i.stockMinimo, activo: i.activo,
    };
    this.modal.set('form');
  }

  guardar(): void {
    const peticion = this.editandoId ? this.servicio.guardar(this.form, this.editandoId) : this.servicio.guardar(this.form);
    this.ejecutar(peticion, this.editandoId ? 'Insumo actualizado' : 'Insumo registrado');
  }

  eliminar(i: Insumo): void {
    if (!confirm(`¿Eliminar el insumo ${i.codigo} - ${i.nombre}?`)) return;
    this.ejecutar(this.servicio.eliminar(i.idinsumo), 'Insumo eliminado');
  }

  abrirMovimiento(i: Insumo, tipo: 'ENTRADA' | 'SALIDA'): void {
    this.seleccionado = i;
    this.movimiento = { tipo, cantidad: 1, motivo: tipo === 'ENTRADA' ? 'Compra a proveedor' : 'Consumo en producción', idpedido: null };
    this.modal.set('movimiento');
  }

  registrarMovimiento(): void {
    if (!this.seleccionado) return;
    const datos = { ...this.movimiento, idpedido: this.movimiento.idpedido || null };
    this.ejecutar(this.servicio.registrarMovimiento(this.seleccionado.idinsumo, datos), 'Movimiento registrado en el kárdex');
  }

  verKardex(i: Insumo): void {
    this.seleccionado = i;
    this.kardex.set([]);
    this.modal.set('kardex');
    this.servicio.kardex(i.idinsumo).subscribe({
      next: (l) => this.kardex.set(l),
      error: (err) => this.notificador.error(err),
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

  private vacio(): InsumoRequest {
    return { codigo: '', nombre: '', unidadMedida: 'unidad', stockActual: 0, stockMinimo: 0, activo: true };
  }
}
