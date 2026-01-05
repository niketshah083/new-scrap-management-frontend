import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () =>
      import('./users/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./roles/role-list/role-list.component').then((m) => m.RoleListComponent),
  },
  {
    path: 'grn-config',
    loadComponent: () =>
      import('./grn-config/grn-config-list.component').then((m) => m.GrnConfigListComponent),
  },
  {
    path: 'external-db',
    loadComponent: () =>
      import('./external-db-config/external-db-config.component').then(
        (m) => m.ExternalDbConfigComponent
      ),
  },
  {
    path: 'rfid-cards',
    loadComponent: () =>
      import('./rfid-cards/rfid-card-list.component').then((m) => m.RfidCardListComponent),
  },
];
