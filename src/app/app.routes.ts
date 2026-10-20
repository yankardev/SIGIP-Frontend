import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthService } from './core/auth.service';
import { adminGuard, authGuard, invitadoGuard } from './core/guards';
import { Shell } from './layout/shell';

export const routes: Routes = [
  { path: 'login', canActivate: [invitadoGuard], loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'registro', canActivate: [invitadoGuard], loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro) },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      // El administrador entra al tablero; el cliente, al catálogo.
      { path: 'inicio', redirectTo: () => (inject(AuthService).esAdmin() ? '/dashboard' : '/catalogo') },
      { path: 'catalogo', loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.Catalogo) },
      { path: 'pedidos', loadComponent: () => import('./pages/pedidos/pedidos').then((m) => m.Pedidos) },
      { path: 'pedidos/:id', loadComponent: () => import('./pages/pedido-detalle/pedido-detalle').then((m) => m.PedidoDetalle) },
      { path: 'disenos', loadComponent: () => import('./pages/disenos/disenos').then((m) => m.Disenos) },
      { path: 'notificaciones', loadComponent: () => import('./pages/notificaciones/notificaciones').then((m) => m.Notificaciones) },
      {
        path: '',
        canActivate: [adminGuard],
        children: [
          { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
          { path: 'admin/catalogo', loadComponent: () => import('./pages/admin-catalogo/admin-catalogo').then((m) => m.AdminCatalogo) },
          { path: 'produccion', loadComponent: () => import('./pages/produccion/produccion').then((m) => m.Produccion) },
          { path: 'inventario', loadComponent: () => import('./pages/inventario/inventario').then((m) => m.Inventario) },
          { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios').then((m) => m.Usuarios) },
        ],
      },
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
