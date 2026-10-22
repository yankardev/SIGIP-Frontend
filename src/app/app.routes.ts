import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthService } from './core/auth.service';
import { authGuard, invitadoGuard, rolGuard } from './core/guards';
import { Shell } from './layout/shell';

export const routes: Routes = [
  { path: 'login', canActivate: [invitadoGuard], loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'registro', canActivate: [invitadoGuard], loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro) },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: 'inicio',
        redirectTo: () => {
          const auth = inject(AuthService);
          if (auth.esCliente()) return '/catalogo';
          if (auth.tieneRol('OPERACIONES') && !auth.esAdmin() && !auth.tieneRol('VENTAS')) return '/produccion';
          return '/dashboard';
        },
      },
      { path: 'dashboard', canActivate: [rolGuard('ADMIN','VENTAS')], loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'clientes', canActivate: [rolGuard('ADMIN','VENTAS')], loadComponent: () => import('./pages/clientes/clientes').then((m) => m.Clientes) },
      { path: 'catalogo', canActivate: [rolGuard('CLIENTE','ADMIN','VENTAS')], loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.Catalogo) },
      { path: 'cotizaciones', canActivate: [rolGuard('CLIENTE','ADMIN','VENTAS')], loadComponent: () => import('./pages/cotizaciones/cotizaciones').then((m) => m.Cotizaciones) },
      { path: 'pedidos', canActivate: [rolGuard('CLIENTE','ADMIN','VENTAS','OPERACIONES')], loadComponent: () => import('./pages/pedidos/pedidos').then((m) => m.Pedidos) },
      { path: 'pedidos/:id', canActivate: [rolGuard('CLIENTE','ADMIN','VENTAS','OPERACIONES')], loadComponent: () => import('./pages/pedido-detalle/pedido-detalle').then((m) => m.PedidoDetalle) },
      { path: 'disenos', canActivate: [rolGuard('CLIENTE','ADMIN','OPERACIONES')], loadComponent: () => import('./pages/disenos/disenos').then((m) => m.Disenos) },
      { path: 'produccion', canActivate: [rolGuard('ADMIN','OPERACIONES')], loadComponent: () => import('./pages/produccion/produccion').then((m) => m.Produccion) },
      { path: 'inventario', canActivate: [rolGuard('ADMIN','OPERACIONES')], loadComponent: () => import('./pages/inventario/inventario').then((m) => m.Inventario) },
      { path: 'reportes', canActivate: [rolGuard('ADMIN','VENTAS')], loadComponent: () => import('./pages/reportes/reportes').then((m) => m.Reportes) },
      { path: 'usuarios', canActivate: [rolGuard('ADMIN')], loadComponent: () => import('./pages/usuarios/usuarios').then((m) => m.Usuarios) },
      { path: 'admin/catalogo', canActivate: [rolGuard('ADMIN','VENTAS')], loadComponent: () => import('./pages/admin-catalogo/admin-catalogo').then((m) => m.AdminCatalogo) },
      { path: 'notificaciones', loadComponent: () => import('./pages/notificaciones/notificaciones').then((m) => m.Notificaciones) },
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
