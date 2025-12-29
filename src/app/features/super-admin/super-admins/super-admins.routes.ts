import { Routes } from '@angular/router';

export const SUPER_ADMINS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./super-admin-list/super-admin-list.component').then(
        (m) => m.SuperAdminListComponent
      ),
  },
];
