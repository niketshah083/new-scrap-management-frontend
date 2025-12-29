import { Routes } from '@angular/router';

export const CONFIG_ROUTES: Routes = [
  {
    path: 'modules',
    loadComponent: () =>
      import('./modules/module-list.component').then((m) => m.ModuleListComponent),
  },
  {
    path: 'operations',
    loadComponent: () =>
      import('./operations/operation-list.component').then((m) => m.OperationListComponent),
  },
  {
    path: 'default-roles',
    loadComponent: () =>
      import('./default-roles/default-role-list.component').then((m) => m.DefaultRoleListComponent),
  },
];
