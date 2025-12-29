import { Routes } from '@angular/router';

export const QC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./qc-list/qc-list.component').then((m) => m.QcListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./qc-form/qc-form.component').then((m) => m.QcFormComponent),
  },
];
