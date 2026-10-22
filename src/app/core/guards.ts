import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Rol } from './models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.autenticado() ? true : inject(Router).createUrlTree(['/login']);
};

export const rolGuard = (...permitidos: Rol[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  if (auth.esAdmin() || permitidos.some((rol) => auth.tieneRol(rol))) return true;
  return inject(Router).createUrlTree(['/inicio']);
};

export const adminGuard: CanActivateFn = rolGuard('ADMIN');

export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.autenticado() ? inject(Router).createUrlTree(['/inicio']) : true;
};
