import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      // Super Admin Routes
      {
        path: 'tenants',
        loadChildren: () =>
          import('./features/super-admin/tenants/tenants.routes').then((m) => m.TENANTS_ROUTES),
      },
      {
        path: 'plans',
        loadChildren: () =>
          import('./features/super-admin/plans/plans.routes').then((m) => m.PLANS_ROUTES),
      },
      {
        path: 'super-admins',
        loadChildren: () =>
          import('./features/super-admin/super-admins/super-admins.routes').then(
            (m) => m.SUPER_ADMINS_ROUTES
          ),
      },
      {
        path: 'config',
        loadChildren: () =>
          import('./features/super-admin/config/config.routes').then((m) => m.CONFIG_ROUTES),
      },
      // Tenant Routes
      {
        path: 'vendors',
        loadChildren: () =>
          import('./features/tenant/vendors/vendors.routes').then((m) => m.VENDORS_ROUTES),
      },
      {
        path: 'materials',
        loadChildren: () =>
          import('./features/tenant/materials/materials.routes').then((m) => m.MATERIALS_ROUTES),
      },
      {
        path: 'purchase-orders',
        loadChildren: () =>
          import('./features/tenant/purchase-orders/purchase-orders.routes').then(
            (m) => m.PURCHASE_ORDERS_ROUTES
          ),
      },
      {
        path: 'grn',
        loadChildren: () => import('./features/tenant/grn/grn.routes').then((m) => m.GRN_ROUTES),
      },
      {
        path: 'gate-pass',
        loadChildren: () =>
          import('./features/tenant/gate-pass/gate-pass.routes').then((m) => m.GATE_PASS_ROUTES),
      },
      {
        path: 'qc',
        loadChildren: () => import('./features/tenant/qc/qc.routes').then((m) => m.QC_ROUTES),
      },
      {
        path: 'qc-reports',
        loadChildren: () =>
          import('./features/tenant/qc-reports/qc-reports.routes').then((m) => m.QC_REPORTS_ROUTES),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/tenant/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      // Direct routes for admin features (for sidebar navigation)
      {
        path: 'users',
        loadComponent: () =>
          import('./features/tenant/admin/users/user-list/user-list.component').then(
            (m) => m.UserListComponent
          ),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/tenant/admin/roles/role-list/role-list.component').then(
            (m) => m.RoleListComponent
          ),
      },
      {
        path: 'grn-config',
        loadComponent: () =>
          import('./features/tenant/admin/grn-config/grn-config-list.component').then(
            (m) => m.GrnConfigListComponent
          ),
      },
      {
        path: 'weighbridge',
        loadChildren: () =>
          import('./features/tenant/weighbridge/weighbridge.routes').then(
            (m) => m.WEIGHBRIDGE_ROUTES
          ),
      },
      {
        path: 'camera',
        loadChildren: () =>
          import('./features/tenant/camera/camera.routes').then((m) => m.CAMERA_ROUTES),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
