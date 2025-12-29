import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';
import { AuthService } from '../../../core/services/auth.service';

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  permission?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    NotificationPanelComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  sidebarCollapsed: boolean = false;
  notificationPanelVisible: boolean = false;
  menuItems: MenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadMenuItems();
  }

  private loadMenuItems(): void {
    const isSuperAdmin = this.authService.isSuperAdmin();

    if (isSuperAdmin) {
      this.menuItems = this.getSuperAdminMenu();
    } else {
      this.menuItems = this.getTenantMenu();
    }
  }

  private getSuperAdminMenu(): MenuItem[] {
    return [
      { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
      { label: 'Tenants', icon: 'pi pi-building', route: '/tenants' },
      { label: 'Plans', icon: 'pi pi-box', route: '/plans' },
      { label: 'Super Admins', icon: 'pi pi-users', route: '/super-admins' },
      {
        label: 'Configuration',
        icon: 'pi pi-cog',
        children: [
          { label: 'Modules', icon: 'pi pi-th-large', route: '/config/modules' },
          { label: 'Operations', icon: 'pi pi-list', route: '/config/operations' },
          { label: 'Default Roles', icon: 'pi pi-id-card', route: '/config/default-roles' },
        ],
      },
    ];
  }

  private getTenantMenu(): MenuItem[] {
    const menu: MenuItem[] = [{ label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' }];

    if (this.authService.hasAnyPermission(['Vendor:List', 'Vendor:Read'])) {
      menu.push({
        label: 'Vendors',
        icon: 'pi pi-truck',
        route: '/vendors',
        permission: 'Vendor:List',
      });
    }

    if (this.authService.hasAnyPermission(['Material:List', 'Material:Read'])) {
      menu.push({
        label: 'Materials',
        icon: 'pi pi-box',
        route: '/materials',
        permission: 'Material:List',
      });
    }

    if (this.authService.hasAnyPermission(['PurchaseOrder:List', 'PurchaseOrder:Read'])) {
      menu.push({
        label: 'Purchase Orders',
        icon: 'pi pi-file',
        route: '/purchase-orders',
        permission: 'PurchaseOrder:List',
      });
    }

    if (
      this.authService.hasAnyPermission([
        'GRN:List',
        'GRN:Read',
        'GRN:GateEntry',
        'GRN:InitialWeighing',
        'GRN:Unloading',
        'GRN:FinalWeighing',
        'GRN:SupervisorReview',
      ])
    ) {
      menu.push({ label: 'GRN', icon: 'pi pi-inbox', route: '/grn', permission: 'GRN:List' });
    }

    if (this.authService.hasAnyPermission(['GatePass:List', 'GatePass:Verify'])) {
      menu.push({
        label: 'Gate Pass',
        icon: 'pi pi-ticket',
        route: '/gate-pass',
        permission: 'GatePass:List',
      });
    }

    if (this.authService.hasAnyPermission(['QC:List', 'QC:Create'])) {
      menu.push({
        label: 'Lab QC',
        icon: 'pi pi-check-square',
        route: '/qc',
        permission: 'QC:List',
      });
    }

    if (this.authService.hasAnyPermission(['QCReport:List'])) {
      menu.push({
        label: 'QC Reports',
        icon: 'pi pi-chart-bar',
        route: '/qc-reports',
        permission: 'QCReport:List',
      });
    }

    if (
      this.authService.hasAnyPermission([
        'User:List',
        'Role:List',
        'GRNFieldConfig:List',
        'ExternalDbConfig:READ',
        'ExternalDbConfig:UPDATE',
      ])
    ) {
      const adminChildren: MenuItem[] = [];
      if (this.authService.hasPermission('User:List')) {
        adminChildren.push({ label: 'Users', icon: 'pi pi-users', route: '/admin/users' });
      }
      if (this.authService.hasPermission('Role:List')) {
        adminChildren.push({ label: 'Roles', icon: 'pi pi-id-card', route: '/admin/roles' });
      }
      if (this.authService.hasPermission('GRNFieldConfig:List')) {
        adminChildren.push({
          label: 'GRN Config',
          icon: 'pi pi-sliders-h',
          route: '/grn-config',
        });
      }
      if (this.authService.hasAnyPermission(['ExternalDbConfig:READ', 'ExternalDbConfig:UPDATE'])) {
        adminChildren.push({
          label: 'External DB',
          icon: 'pi pi-database',
          route: '/admin/external-db',
        });
      }
      if (adminChildren.length > 0) {
        menu.push({ label: 'Administration', icon: 'pi pi-cog', children: adminChildren });
      }
    }

    return menu;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  openNotifications(): void {
    this.notificationPanelVisible = true;
  }
}
