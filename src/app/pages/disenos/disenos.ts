import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { Diseno, DisenoRequest } from '../../core/models';
import { DisenoService } from '../../core/services/diseno.service';
import { NotificadorService } from '../../core/notificador.service';
import { EstadoBadge } from '../../shared/estado-badge';
import { Modal } from '../../shared/modal';

/** Versiones de diseño: el administrador las publica y el cliente las aprueba u observa. */
@Component({
  selector: 'app-disenos',
  imports: [DatePipe, FormsModule, RouterLink, EstadoBadge, Modal],
  templateUrl: './disenos.html',
})
export class Disenos implements OnInit {
  /** ?pedido=ID en la URL (filtro inicial). */
  readonly pedido = input<string>();

  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(DisenoService);
  private readonly notificador = inject(NotificadorService);

  protected readonly disenos = signal<Diseno[]>([]);
  protected readonly cargando = signal(true);
  protected readonly trabajando = signal(false);
  protected filtroPedido: number | null = null;

  protected readonly modal = signal<'form' | 'decision' | null>(null);
  protected editandoId: number | null = null;
  protected form: DisenoRequest = this.vacio();
  protected decision = { diseno: null as Diseno | null, tipo: 'APROBAR' as 'APROBAR' | 'OBSERVAR', comentario: '' };

  ngOnInit(): void {
    const p = Number(this.pedido());
    this.filtroPedido = p > 0 ? p : null;
    this.cargar();
    if (this.filtroPedido && this.auth.esAdmin()) {
      this.nuevo();
    }
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar(this.filtroPedido).subscribe({
      next: (l) => {
        this.disenos.set([...l].sort((a, b) => b.idpedido - a.idpedido || b.version - a.version));
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.notificador.error(err, 'No se pudieron cargar los diseños');
      },
    });
  }

  nuevo(): void {
    this.editandoId = null;
    this.form = { ...this.vacio(), idpedido: this.filtroPedido ?? (null as unknown as number) };
    this.modal.set('form');
  }

  editar(d: Diseno): void {
    this.editandoId = d.iddiseno;
    this.form = { idpedido: d.idpedido, nombreArchivo: d.nombreArchivo, urlArchivo: d.urlArchivo ?? '', descripcion: d.descripcion ?? '' };
    this.modal.set('form');
  }

  guardar(): void {
    const peticion = this.editandoId
      ? this.servicio.actualizar(this.editandoId, this.form)
      : this.servicio.registrar(this.form);
    this.ejecutar(peticion, this.editandoId ? 'Diseño actualizado' : 'Nueva versión publicada para el cliente');
  }

  eliminar(d: Diseno): void {
    if (!confirm(`¿Eliminar la versión ${d.version} del pedido #${d.idpedido}?`)) return;
    this.ejecutar(this.servicio.eliminar(d.iddiseno), 'Diseño eliminado');
  }

  abrirDecision(d: Diseno, tipo: 'APROBAR' | 'OBSERVAR'): void {
    this.decision = { diseno: d, tipo, comentario: '' };
    this.modal.set('decision');
  }

  decidir(): void {
    const d = this.decision.diseno;
    if (!d) return;
    this.ejecutar(
      this.servicio.decidir(d.iddiseno, this.decision.tipo, this.decision.comentario),
      this.decision.tipo === 'APROBAR' ? '¡Diseño aprobado! El taller ya puede producir tu pedido' : 'Observación enviada al diseñador',
    );
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

  private vacio(): DisenoRequest {
    return { idpedido: null as unknown as number, nombreArchivo: '', urlArchivo: '', descripcion: '' };
  }
}
