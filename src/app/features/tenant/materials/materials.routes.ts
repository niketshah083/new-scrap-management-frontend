import { Routes } from '@angular/router';

export const MATERIALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./material-list/material-list.component').then((m) => m.MaterialListComponent),
  },
];
