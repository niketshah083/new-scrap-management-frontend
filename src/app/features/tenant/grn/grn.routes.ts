import { Routes } from '@angular/router';

export const GRN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./grn-list/grn-list.component').then((m) => m.GrnListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./grn-wizard/grn-wizard.component').then((m) => m.GrnWizardComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./grn-detail/grn-detail.component').then((m) => m.GrnDetailComponent),
  },
  {
    path: ':id/step/:step',
    loadComponent: () =>
      import('./grn-wizard/grn-wizard.component').then((m) => m.GrnWizardComponent),
  },
];
