import { Routes } from '@angular/router';

export const QC_REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./qc-report-list/qc-report-list.component').then((m) => m.QcReportListComponent),
  },
];
