import { Routes } from '@angular/router';

export const PURCHASE_ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./po-list/po-list.component').then((m) => m.PoListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./po-form/po-form.component').then((m) => m.PoFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./po-form/po-form.component').then((m) => m.PoFormComponent),
  },
];
