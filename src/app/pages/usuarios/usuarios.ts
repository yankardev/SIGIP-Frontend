import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { Rol, Usuario } from '../../core/models';
import { UsuariosService } from '../../core/services/usuarios.service';
import { NotificadorService } from '../../core/notificador.service';
import { Modal } from '../../shared/modal';

/** Administración de usuarios y roles (ADMIN). Las contraseñas se guardan con BCrypt en auth-service. */
@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, Modal],
  templateUrl: './usuarios.html',
})
export class Usuarios implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(UsuariosService);
  private readonly notificador = inject(NotificadorService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly trabajando = signal(false);
  protected readonly modal = signal(false);
  protected editandoId: number | null = null;
  protected form = this.vacio();

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.servicio.listar().subscribe({
      next: (l) => this.usuarios.set(l),
      error: (err) => this.notificador.error(err, 'No se pudieron cargar los usuarios'),
    });
  }

  nuevo(): void {
    this.editandoId = null;
    this.form = this.vacio();
    this.modal.set(true);
  }

  editar(u: Usuario): void {
    this.editandoId = u.idusuario;
    this.form = {
      nomusuario: u.nomusuario, email: u.email, password: '', nombres: u.nombres, apellidos: u.apellidos,
      activo: u.activo, admin: u.roles.includes('ADMIN'), cliente: u.roles.includes('CLIENTE'),
    };
    this.modal.set(true);
  }

  guardar(): void {
    const roles: Rol[] = [];
    if (this.form.admin) roles.push('ADMIN');
    if (this.form.cliente) roles.push('CLIENTE');
    if (roles.length === 0) {
      this.notificador.error(null, 'Asigna al menos un rol');
      return;
    }
    const { admin, cliente, ...datos } = this.form;
    this.ejecutar(
      this.servicio.guardar({ ...datos, roles }, this.editandoId ?? undefined),
      this.editandoId ? 'Usuario actualizado' : 'Usuario creado',
    );
  }

  eliminar(u: Usuario): void {
    if (!confirm(`¿Eliminar al usuario ${u.nomusuario}?`)) return;
    this.ejecutar(this.servicio.eliminar(u.idusuario), 'Usuario eliminado');
  }

  private ejecutar(peticion: Observable<unknown>, mensaje: string): void {
    this.trabajando.set(true);
    peticion.subscribe({
      next: () => {
        this.trabajando.set(false);
        this.modal.set(false);
        this.notificador.ok(mensaje);
        this.cargar();
      },
      error: (err) => {
        this.trabajando.set(false);
        this.notificador.error(err);
      },
    });
  }

  private vacio() {
    return { nomusuario: '', email: '', password: '', nombres: '', apellidos: '', activo: true, admin: false, cliente: true };
  }
}
