import { Routes } from '@angular/router';

export const GATE_PASS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./gate-pass-list/gate-pass-list.component').then((m) => m.GatePassListComponent),
  },
  {
    path: 'verify',
    loadComponent: () =>
      import('./gate-pass-verify/gate-pass-verify.component').then(
        (m) => m.GatePassVerifyComponent
      ),
  },
];
