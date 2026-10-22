import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthService } from './core/auth.service';
import { authGuard, invitadoGuard, rolGuard } from './core/guards';
import { Shell } from './layout/shell';

export const routes: Routes = [
  { path: 'login', canActivate: [invitadoGuard], loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'inicio', redirectTo: () => inject(AuthService).tieneRol('OPERACIONES') && !inject(AuthService).esAdmin() ? '/produccion' : '/dashboard' },
      { path: 'dashboard', canActivate: [rolGuard('ADMIN','VENTAS')], loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'catalogo', canActivate: [rolGuard('ADMIN','VENTAS')], loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.Catalogo) },
      { path: 'pedidos', canActivate: [rolGuard('ADMIN','VENTAS','OPERACIONES')], loadComponent: () => import('./pages/pedidos/pedidos').then((m) => m.Pedidos) },
      { path: 'pedidos/:id', canActivate: [rolGuard('ADMIN','VENTAS','OPERACIONES')], loadComponent: () => import('./pages/pedido-detalle/pedido-detalle').then((m) => m.PedidoDetalle) },
      { path: 'disenos', canActivate: [rolGuard('ADMIN','OPERACIONES')], loadComponent: () => import('./pages/disenos/disenos').then((m) => m.Disenos) },
      { path: 'produccion', canActivate: [rolGuard('ADMIN','OPERACIONES')], loadComponent: () => import('./pages/produccion/produccion').then((m) => m.Produccion) },
      { path: 'inventario', canActivate: [rolGuard('ADMIN','OPERACIONES')], loadComponent: () => import('./pages/inventario/inventario').then((m) => m.Inventario) },
      { path: 'reportes', canActivate: [rolGuard('ADMIN')], loadComponent: () => import('./pages/reportes/reportes').then((m) => m.Reportes) },
      { path: 'usuarios', canActivate: [rolGuard('ADMIN')], loadComponent: () => import('./pages/usuarios/usuarios').then((m) => m.Usuarios) },
      { path: 'admin/catalogo', canActivate: [rolGuard('ADMIN')], loadComponent: () => import('./pages/admin-catalogo/admin-catalogo').then((m) => m.AdminCatalogo) },
      { path: 'notificaciones', loadComponent: () => import('./pages/notificaciones/notificaciones').then((m) => m.Notificaciones) },
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
