import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Usuario } from '../../core/models';
import { ClienteRequest, ClientesService } from '../../core/services/clientes.service';
import { NotificadorService } from '../../core/notificador.service';
import { Modal } from '../../shared/modal';

@Component({
  selector: 'app-clientes',
  imports: [FormsModule, Modal],
  templateUrl: './clientes.html',
})
export class Clientes implements OnInit {
  private readonly service = inject(ClientesService);
  private readonly notificador = inject(NotificadorService);

  protected readonly clientes = signal<Usuario[]>([]);
  protected readonly busqueda = signal('');
  protected readonly cargando = signal(true);
  protected readonly trabajando = signal(false);
  protected readonly modal = signal(false);
  protected editandoId: number | null = null;
  protected form: ClienteRequest = this.vacio();

  protected readonly visibles = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return this.clientes().filter((c) => !q || `${c.nombres} ${c.apellidos} ${c.email} ${c.nomusuario}`.toLowerCase().includes(q));
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: (l) => { this.clientes.set(l); this.cargando.set(false); },
      error: (e) => { this.cargando.set(false); this.notificador.error(e, 'No se pudieron cargar los clientes'); },
    });
  }

  nuevo(): void { this.editandoId = null; this.form = this.vacio(); this.modal.set(true); }

  editar(c: Usuario): void {
    this.editandoId = c.idusuario;
    this.form = { nomusuario: c.nomusuario, email: c.email, password: '', nombres: c.nombres, apellidos: c.apellidos, activo: c.activo };
    this.modal.set(true);
  }

  guardar(): void {
    const peticion = this.service.guardar(this.form, this.editandoId ?? undefined);
    this.ejecutar(peticion, this.editandoId ? 'Cliente actualizado' : 'Cliente registrado');
  }

  eliminar(c: Usuario): void {
    if (!confirm(`¿Eliminar al cliente ${c.nombres} ${c.apellidos}?`)) return;
    this.ejecutar(this.service.eliminar(c.idusuario), 'Cliente eliminado');
  }

  private ejecutar(peticion: Observable<unknown>, mensaje: string): void {
    this.trabajando.set(true);
    peticion.subscribe({
      next: () => { this.trabajando.set(false); this.modal.set(false); this.notificador.ok(mensaje); this.cargar(); },
      error: (e) => { this.trabajando.set(false); this.notificador.error(e); },
    });
  }

  private vacio(): ClienteRequest {
    return { nomusuario: '', email: '', password: '', nombres: '', apellidos: '', activo: true };
  }
}
