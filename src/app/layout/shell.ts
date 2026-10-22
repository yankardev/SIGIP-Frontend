import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/services/notificaciones.service';

interface Opcion {
  ruta: string;
  texto: string;
  icono: string;
  roles: string[];
  grupo: 'GENERAL' | 'COMERCIAL' | 'OPERACIONES' | 'GESTION';
}

interface GrupoMenu {
  id: Opcion['grupo'];
  texto: string;
}

const MENU: Opcion[] = [
  { ruta: '/dashboard', texto: 'Dashboard', icono: '⌂', roles: ['ADMIN', 'VENTAS'], grupo: 'GENERAL' },
  { ruta: '/catalogo', texto: 'Catálogo de servicios', icono: '1', roles: ['ADMIN', 'VENTAS'], grupo: 'COMERCIAL' },
  { ruta: '/pedidos', texto: 'Pedidos y pagos', icono: '2', roles: ['ADMIN', 'VENTAS', 'OPERACIONES'], grupo: 'COMERCIAL' },
  { ruta: '/disenos', texto: 'Diseño y validación', icono: '3', roles: ['ADMIN', 'OPERACIONES'], grupo: 'OPERACIONES' },
  { ruta: '/produccion', texto: 'Producción', icono: '4', roles: ['ADMIN', 'OPERACIONES'], grupo: 'OPERACIONES' },
  { ruta: '/inventario', texto: 'Inventario', icono: '5', roles: ['ADMIN', 'OPERACIONES'], grupo: 'OPERACIONES' },
  { ruta: '/reportes', texto: 'Reportes', icono: '▥', roles: ['ADMIN'], grupo: 'GESTION' },
  { ruta: '/usuarios', texto: 'Usuarios y roles', icono: '◎', roles: ['ADMIN'], grupo: 'GESTION' },
  { ruta: '/notificaciones', texto: 'Notificaciones', icono: '✉', roles: ['ADMIN', 'VENTAS', 'OPERACIONES'], grupo: 'GESTION' },
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

  protected readonly grupos: GrupoMenu[] = [
    { id: 'GENERAL', texto: 'GENERAL' },
    { id: 'COMERCIAL', texto: 'COMERCIAL · INICIO DEL FLUJO' },
    { id: 'OPERACIONES', texto: 'OPERACIONES · CONTINUACIÓN' },
    { id: 'GESTION', texto: 'SUPERVISIÓN Y CONTROL' },
  ];

  protected opcionesGrupo(grupo: Opcion['grupo']): Opcion[] {
    const roles = this.auth.usuario()?.roles ?? [];
    return MENU.filter(
      (o) => o.grupo === grupo && (o.roles.some((r) => roles.includes(r as never)) || this.auth.esAdmin()),
    );
  }

  protected get rolVisible(): string {
    if (this.auth.esAdmin()) return 'Administrador';
    if (this.auth.tieneRol('VENTAS')) return 'Ventas';
    if (this.auth.tieneRol('OPERACIONES')) return 'Operaciones';
    return 'Personal interno';
  }

  ngOnInit(): void {
    this.notificaciones.actualizarContador();
  }
}
