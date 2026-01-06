import { Routes } from '@angular/router';

export const WEIGHBRIDGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./weighbridge-list/weighbridge-list.component').then(
        (m) => m.WeighbridgeListComponent
      ),
  },
  {
    path: 'config/:id',
    loadComponent: () =>
      import('./weighbridge-config/weighbridge-config.component').then(
        (m) => m.WeighbridgeConfigComponent
      ),
  },
];
