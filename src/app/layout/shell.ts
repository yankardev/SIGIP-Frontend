import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/services/notificaciones.service';

interface OpcionInterna {
  ruta: string;
  texto: string;
  icono: string;
  roles: string[];
  grupo: 'GENERAL' | 'COMERCIAL' | 'OPERACIONES' | 'GESTION';
}
interface GrupoMenu { id: OpcionInterna['grupo']; texto: string; }
interface OpcionCliente { ruta: string; texto: string; icono: string; }

const MENU_INTERNO: OpcionInterna[] = [
  { ruta: '/dashboard', texto: 'Dashboard', icono: '⌂', roles: ['ADMIN', 'VENTAS'], grupo: 'GENERAL' },
  { ruta: '/clientes', texto: 'Clientes', icono: '♙', roles: ['ADMIN', 'VENTAS'], grupo: 'COMERCIAL' },
  { ruta: '/catalogo', texto: 'Nuevo pedido', icono: '＋', roles: ['ADMIN', 'VENTAS'], grupo: 'COMERCIAL' },
  { ruta: '/cotizaciones', texto: 'Cotizaciones', icono: 'S/', roles: ['ADMIN', 'VENTAS'], grupo: 'COMERCIAL' },
  { ruta: '/pedidos', texto: 'Pedidos y pagos', icono: '≡', roles: ['ADMIN', 'VENTAS', 'OPERACIONES'], grupo: 'COMERCIAL' },
  { ruta: '/admin/catalogo', texto: 'Servicios y precios', icono: '▣', roles: ['ADMIN', 'VENTAS'], grupo: 'COMERCIAL' },
  { ruta: '/disenos', texto: 'Diseño y aprobación', icono: '✎', roles: ['ADMIN', 'OPERACIONES'], grupo: 'OPERACIONES' },
  { ruta: '/produccion', texto: 'Producción', icono: '⚙', roles: ['ADMIN', 'OPERACIONES'], grupo: 'OPERACIONES' },
  { ruta: '/inventario', texto: 'Inventario y kárdex', icono: '▤', roles: ['ADMIN', 'OPERACIONES'], grupo: 'OPERACIONES' },
  { ruta: '/reportes', texto: 'Reportes', icono: '▥', roles: ['ADMIN', 'VENTAS'], grupo: 'GESTION' },
  { ruta: '/usuarios', texto: 'Usuarios y roles', icono: '◎', roles: ['ADMIN'], grupo: 'GESTION' },
  { ruta: '/notificaciones', texto: 'Eventos y avisos', icono: '✉', roles: ['ADMIN', 'VENTAS', 'OPERACIONES'], grupo: 'GESTION' },
];

const MENU_CLIENTE: OpcionCliente[] = [
  { ruta: '/catalogo', texto: 'Servicios', icono: '▣' },
  { ruta: '/cotizaciones', texto: 'Mis cotizaciones', icono: 'S/' },
  { ruta: '/pedidos', texto: 'Mis pedidos', icono: '≡' },
  { ruta: '/disenos', texto: 'Mis diseños', icono: '✎' },
  { ruta: '/notificaciones', texto: 'Notificaciones', icono: '✉' },
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
  protected readonly opcionesCliente = MENU_CLIENTE;

  protected readonly grupos: GrupoMenu[] = [
    { id: 'GENERAL', texto: 'GENERAL' },
    { id: 'COMERCIAL', texto: 'COMERCIAL · VENTAS' },
    { id: 'OPERACIONES', texto: 'OPERACIONES' },
    { id: 'GESTION', texto: 'SUPERVISIÓN Y CONTROL' },
  ];

  protected opcionesGrupo(grupo: OpcionInterna['grupo']): OpcionInterna[] {
    const roles = this.auth.usuario()?.roles ?? [];
    return MENU_INTERNO.filter((o) => o.grupo === grupo && o.roles.some((r) => roles.includes(r as never)));
  }

  protected get rolVisible(): string {
    if (this.auth.esAdmin()) return 'Administrador';
    if (this.auth.tieneRol('VENTAS')) return 'Área comercial';
    if (this.auth.tieneRol('OPERACIONES')) return 'Operaciones';
    return 'Cliente';
  }

  ngOnInit(): void { this.notificaciones.actualizarContador(); }
}
