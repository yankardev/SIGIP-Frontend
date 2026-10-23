import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cliente, ClienteRequest } from '../../core/models';
import { VentasService } from '../../core/services/ventas.service';
import { NotificadorService } from '../../core/notificador.service';
import { Modal } from '../../shared/modal';

@Component({
  selector: 'app-clientes',
  imports: [FormsModule, Modal],
  templateUrl: './clientes.html',
})
export class Clientes implements OnInit {
  private readonly ventas = inject(VentasService);
  private readonly notificador = inject(NotificadorService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly trabajando = signal(false);
  protected readonly modal = signal(false);
  protected readonly busqueda = signal('');
  protected editandoId: number | null = null;
  protected form: ClienteRequest = this.vacio();

  protected readonly visibles = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.clientes();
    return this.clientes().filter(c => [c.razonSocial, c.numeroDocumento, c.contacto, c.telefono, c.email]
      .some(v => (v ?? '').toLowerCase().includes(q)));
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.ventas.clientes().subscribe({
      next: l => { this.clientes.set(l); this.cargando.set(false); },
      error: e => { this.cargando.set(false); this.notificador.error(e, 'No se pudieron cargar los clientes'); },
    });
  }

  nuevo(): void { this.editandoId = null; this.form = this.vacio(); this.modal.set(true); }

  editar(c: Cliente): void {
    this.editandoId = c.idcliente;
    this.form = {
      tipoDocumento: c.tipoDocumento, numeroDocumento: c.numeroDocumento, razonSocial: c.razonSocial,
      contacto: c.contacto ?? '', telefono: c.telefono ?? '', email: c.email ?? '', direccion: c.direccion ?? '', activo: c.activo,
    };
    this.modal.set(true);
  }

  guardar(): void {
    this.trabajando.set(true);
    this.ventas.guardarCliente(this.form, this.editandoId ?? undefined).subscribe({
      next: () => { this.trabajando.set(false); this.modal.set(false); this.notificador.ok(this.editandoId ? 'Cliente actualizado' : 'Cliente registrado'); this.cargar(); },
      error: e => { this.trabajando.set(false); this.notificador.error(e); },
    });
  }

  desactivar(c: Cliente): void {
    if (!confirm(`¿Desactivar a ${c.razonSocial}?`)) return;
    this.ventas.desactivarCliente(c.idcliente).subscribe({ next: () => { this.notificador.ok('Cliente desactivado'); this.cargar(); }, error: e => this.notificador.error(e) });
  }

  private vacio(): ClienteRequest {
    return { tipoDocumento: 'RUC', numeroDocumento: '', razonSocial: '', contacto: '', telefono: '', email: '', direccion: '', activo: true };
  }
}
