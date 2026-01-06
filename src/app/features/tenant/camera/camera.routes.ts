import { Routes } from '@angular/router';

export const CAMERA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./camera-list/camera-list.component').then((m) => m.CameraListComponent),
  },
  {
    path: 'config/:id',
    loadComponent: () =>
      import('./camera-config/camera-config.component').then((m) => m.CameraConfigComponent),
  },
  {
    path: 'preview/:id',
    loadComponent: () =>
      import('./camera-preview/camera-preview.component').then((m) => m.CameraPreviewComponent),
  },
];
