import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

interface Opcion {
  ruta: string;
  texto: string;
  icono: string;
  roles: string[];
  grupo: 'TRABAJO' | 'CONTROL';
}

interface GrupoMenu {
  id: Opcion['grupo'];
  texto: string;
}

const MENU: Opcion[] = [
  { ruta: '/dashboard', texto: 'Dashboard', icono: '⌂', roles: ['ADMIN', 'VENTAS', 'OPERACIONES'], grupo: 'TRABAJO' },
  { ruta: '/clientes', texto: 'Clientes', icono: '◉', roles: ['ADMIN', 'VENTAS'], grupo: 'TRABAJO' },
  { ruta: '/pedidos', texto: 'Pedidos', icono: '▣', roles: ['ADMIN', 'VENTAS', 'OPERACIONES'], grupo: 'TRABAJO' },
  { ruta: '/produccion', texto: 'Producción', icono: '⚙', roles: ['ADMIN', 'OPERACIONES'], grupo: 'TRABAJO' },
  { ruta: '/inventario', texto: 'Inventario', icono: '▦', roles: ['ADMIN', 'OPERACIONES'], grupo: 'TRABAJO' },
  { ruta: '/reportes', texto: 'Reportes', icono: '▥', roles: ['ADMIN'], grupo: 'CONTROL' },
  { ruta: '/usuarios', texto: 'Usuarios', icono: '◎', roles: ['ADMIN'], grupo: 'CONTROL' },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly menuAbierto = signal(false);

  protected readonly grupos: GrupoMenu[] = [
    { id: 'TRABAJO', texto: 'GESTIÓN DEL DÍA A DÍA' },
    { id: 'CONTROL', texto: 'ADMINISTRACIÓN' },
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
}
