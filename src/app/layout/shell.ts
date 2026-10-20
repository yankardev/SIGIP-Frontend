import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotificacionesService } from '../core/services/notificaciones.service';

interface Opcion {
  ruta: string;
  texto: string;
  icono: string;
  soloAdmin?: boolean;
}

const MENU: Opcion[] = [
  { ruta: '/dashboard', texto: 'Dashboard', icono: '▦', soloAdmin: true },
  { ruta: '/catalogo', texto: 'Catálogo', icono: '◫' },
  { ruta: '/pedidos', texto: 'Pedidos y pagos', icono: '≡' },
  { ruta: '/disenos', texto: 'Diseños', icono: '✎' },
  { ruta: '/produccion', texto: 'Producción', icono: '⚙', soloAdmin: true },
  { ruta: '/inventario', texto: 'Inventario', icono: '▤', soloAdmin: true },
  { ruta: '/admin/catalogo', texto: 'Gestionar catálogo', icono: '✚', soloAdmin: true },
  { ruta: '/usuarios', texto: 'Usuarios', icono: '☺', soloAdmin: true },
  { ruta: '/notificaciones', texto: 'Notificaciones', icono: '✉' },
];

/** Estructura de la aplicación: menú lateral según el rol, barra superior y contenido. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class Shell implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly notificaciones = inject(NotificacionesService);
  protected readonly menuAbierto = signal(false);
  protected readonly opciones = computed(() => MENU.filter((o) => !o.soloAdmin || this.auth.esAdmin()));

  ngOnInit(): void {
    this.notificaciones.actualizarContador();
  }
}
