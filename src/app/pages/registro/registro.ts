import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NotificadorService, mensajeDeError } from '../../core/notificador.service';

/** Registro público de clientes (POST /auth/registro). */
@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificador = inject(NotificadorService);

  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    nomusuario: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    const datos = this.form.getRawValue();
    this.auth.registrar(datos).subscribe({
      next: () => {
        // Inicia sesión de inmediato con la cuenta recién creada.
        this.auth.login(datos.nomusuario, datos.password).subscribe({
          next: () => {
            this.notificador.ok('¡Bienvenido a SIGIP! Tu cuenta fue creada');
            this.router.navigate(['/inicio']);
          },
          error: () => this.router.navigate(['/login']),
        });
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(mensajeDeError(err));
      },
    });
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.touched && c.invalid;
  }
}
