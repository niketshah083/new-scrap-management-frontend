import { Routes } from '@angular/router';

export const DELIVERY_ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./do-list/do-list.component').then((m) => m.DoListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./do-form/do-form.component').then((m) => m.DoFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./do-form/do-form.component').then((m) => m.DoFormComponent),
  },
  // DO Processing routes
  {
    path: 'processing',
    loadComponent: () =>
      import('./do-processing/do-processing-list/do-processing-list.component').then(
        (m) => m.DoProcessingListComponent
      ),
  },
  {
    path: 'processing/:id',
    loadComponent: () =>
      import('./do-processing/do-processing-detail/do-processing-detail.component').then(
        (m) => m.DoProcessingDetailComponent
      ),
  },
];
