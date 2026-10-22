import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/services/notificaciones.service';

interface Opcion {
  ruta: string;
  texto: string;
  icono: string;
}

const MENU_ADMIN: Opcion[] = [
  { ruta: '/dashboard', texto: 'Dashboard', icono: '▦' },
  { ruta: '/pedidos', texto: 'Pedidos y pagos', icono: '≡' },
  { ruta: '/disenos', texto: 'Diseños', icono: '✎' },
  { ruta: '/produccion', texto: 'Producción', icono: '⚙' },
  { ruta: '/inventario', texto: 'Inventario', icono: '▤' },
  { ruta: '/admin/catalogo', texto: 'Catálogo de servicios', icono: '✚' },
  { ruta: '/usuarios', texto: 'Usuarios y roles', icono: '☺' },
  { ruta: '/reportes', texto: 'Reportes', icono: '▥' },
  { ruta: '/notificaciones', texto: 'Notificaciones', icono: '✉' },
];

const MENU_CLIENTE: Opcion[] = [
  { ruta: '/catalogo', texto: 'Catálogo', icono: '◫' },
  { ruta: '/pedidos', texto: 'Mis pedidos', icono: '≡' },
  { ruta: '/disenos', texto: 'Mis diseños', icono: '✎' },
  { ruta: '/notificaciones', texto: 'Notificaciones', icono: '✉' },
];

/** Dos experiencias claramente diferenciadas: portal de compras para clientes y portal de gestión para personal interno. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class Shell implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly notificaciones = inject(NotificacionesService);
  protected readonly menuAbierto = signal(false);
  protected readonly opcionesAdmin = MENU_ADMIN;
  protected readonly opcionesCliente = MENU_CLIENTE;

  ngOnInit(): void {
    this.notificaciones.actualizarContador();
  }
}
