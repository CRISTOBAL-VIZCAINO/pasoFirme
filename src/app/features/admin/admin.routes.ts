import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';

import { AdminService } from './admin.service';

const soloConSesion: CanActivateFn = () => {
  const admin = inject(AdminService);
  return admin.sesionActiva() ? true : inject(Router).createUrlTree(['/admin']);
};

/** Rutas del panel. Se cargan de forma diferida: el público no descarga este código. */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-login').then((m) => m.AdminLogin),
    title: 'Panel',
  },
  {
    path: 'panel',
    canActivate: [soloConSesion],
    loadComponent: () => import('./admin-panel').then((m) => m.AdminPanel),
    title: 'Panel',
  },
];
