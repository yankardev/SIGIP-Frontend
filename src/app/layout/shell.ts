import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/services/notificaciones.service';

interface Opcion { ruta: string; texto: string; icono: string; roles: string[]; }

const MENU: Opcion[] = [
  { ruta: '/dashboard', texto: 'Dashboard', icono: '▦', roles: ['ADMIN','VENTAS','OPERACIONES'] },
  { ruta: '/catalogo', texto: 'Catálogo de servicios', icono: '▣', roles: ['ADMIN','VENTAS'] },
  { ruta: '/pedidos', texto: 'Pedidos y pagos', icono: '≡', roles: ['ADMIN','VENTAS','OPERACIONES'] },
  { ruta: '/disenos', texto: 'Diseño', icono: '✎', roles: ['ADMIN','OPERACIONES'] },
  { ruta: '/produccion', texto: 'Producción', icono: '⚙', roles: ['ADMIN','OPERACIONES'] },
  { ruta: '/inventario', texto: 'Inventario', icono: '▤', roles: ['ADMIN','OPERACIONES'] },
  { ruta: '/reportes', texto: 'Reportes', icono: '▥', roles: ['ADMIN'] },
  { ruta: '/usuarios', texto: 'Usuarios y roles', icono: '☺', roles: ['ADMIN'] },
  { ruta: '/notificaciones', texto: 'Notificaciones', icono: '✉', roles: ['ADMIN','VENTAS','OPERACIONES'] },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class Shell implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly notificaciones = inject(NotificacionesService);
  protected readonly menuAbierto = signal(false);

  protected get opciones(): Opcion[] {
    const roles = this.auth.usuario()?.roles ?? [];
    return MENU.filter(o => o.roles.some(r => roles.includes(r as never)) || this.auth.esAdmin());
  }

  protected get rolVisible(): string {
    if (this.auth.esAdmin()) return 'Administrador';
    if (this.auth.tieneRol('VENTAS')) return 'Ventas';
    if (this.auth.tieneRol('OPERACIONES')) return 'Operaciones';
    return 'Personal interno';
  }

  ngOnInit(): void { this.notificaciones.actualizarContador(); }
}
