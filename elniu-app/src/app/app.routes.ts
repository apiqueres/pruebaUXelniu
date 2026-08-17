import { Routes } from '@angular/router';

/* Una ruta por seccion. Cada pagina se descarga solo cuando se visita, de modo
   que quien entra a mirar la carta no se baja tambien los menus ni el admin. */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/inicio.page').then((m) => m.InicioPage),
    title: 'Restaurant el Niu · Cocina valenciana en Sueca',
  },
  {
    path: 'carta',
    loadComponent: () => import('./pages/carta.page').then((m) => m.CartaPage),
    title: 'La carta · Restaurant el Niu',
  },
  {
    path: 'menus',
    loadComponent: () => import('./pages/menus.page').then((m) => m.MenusPage),
    title: 'Menús · Restaurant el Niu',
  },
  {
    path: 'eventos',
    loadComponent: () => import('./pages/eventos.page').then((m) => m.EventosPage),
    title: 'Eventos y celebraciones · Restaurant el Niu',
  },
  {
    path: 'reservar',
    loadComponent: () => import('./pages/reservar.page').then((m) => m.ReservarPage),
    title: 'Visítanos y reserva · Restaurant el Niu',
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then((m) => m.AdminPage),
    title: 'Administración · Restaurant el Niu',
  },
  { path: '**', redirectTo: '' },
];
