import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ModuleCode } from '../../../core/enums/modules.enum';
import { OperationCode } from '../../../core/enums/operations.enum';

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  permission?: string;
  children?: MenuItem[];
  expanded?: boolean;
  superAdminOnly?: boolean;
  tenantOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed: boolean = false;
  @Input() menuItems: MenuItem[] = [];
  @Output() collapsedChange = new EventEmitter<boolean>();

  private userSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to user changes to reinitialize menu when user logs in
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        console.log('User loaded, isSuperAdmin:', user.isSuperAdmin);
        this.initializeMenu();
      }
    });

    // Also initialize immediately if user is already loaded
    if (this.menuItems.length === 0) {
      this.initializeMenu();
    }
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  private initializeMenu(): void {
    const isSuperAdmin = this.authService.isSuperAdmin();

    if (isSuperAdmin) {
      // Super Admin Menu
      this.menuItems = [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          route: '/dashboard',
        },
        {
          label: 'Tenants',
          icon: 'pi pi-building',
          route: '/tenants',
        },
        {
          label: 'Plans',
          icon: 'pi pi-list',
          route: '/plans',
        },
        {
          label: 'Super Admins',
          icon: 'pi pi-users',
          route: '/super-admins',
        },
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
    } else {
      // Tenant User Menu - filter by permissions
      const tenantMenuItems: MenuItem[] = [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          route: '/dashboard',
          permission: `${ModuleCode.DASHBOARD}:${OperationCode.READ}`,
        },
        {
          label: 'GRN',
          icon: 'pi pi-file',
          route: '/grn',
          permission: `${ModuleCode.GRN}:${OperationCode.LIST}`,
        },
        {
          label: 'Gate Pass',
          icon: 'pi pi-id-card',
          route: '/gate-pass',
          permission: `${ModuleCode.GATE_PASS}:${OperationCode.LIST}`,
        },
        {
          label: 'QC Inspection',
          icon: 'pi pi-check-circle',
          route: '/qc',
          permission: `${ModuleCode.QC}:${OperationCode.LIST}`,
        },
        {
          label: 'Vendors',
          icon: 'pi pi-users',
          route: '/vendors',
          permission: `${ModuleCode.VENDORS}:${OperationCode.LIST}`,
        },
        {
          label: 'Materials',
          icon: 'pi pi-box',
          route: '/materials',
          permission: `${ModuleCode.MATERIALS}:${OperationCode.LIST}`,
        },
        {
          label: 'Purchase Orders',
          icon: 'pi pi-shopping-cart',
          route: '/purchase-orders',
          permission: `${ModuleCode.PURCHASE_ORDERS}:${OperationCode.LIST}`,
        },
        {
          label: 'Users',
          icon: 'pi pi-user',
          route: '/users',
          permission: `${ModuleCode.USERS}:${OperationCode.LIST}`,
        },
        {
          label: 'Roles',
          icon: 'pi pi-shield',
          route: '/roles',
          permission: `${ModuleCode.ROLES}:${OperationCode.LIST}`,
        },
        {
          label: 'GRN Config',
          icon: 'pi pi-cog',
          route: '/grn-config',
          permission: 'GRNFieldConfig:LIST',
        },
      ];

      this.menuItems = tenantMenuItems.filter((item) => {
        return this.hasPermission(item.permission);
      });
    }

    console.log(
      'Menu items:',
      this.menuItems.map((m) => m.label)
    );
  }

  private hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return this.authService.hasPermission(permission);
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  toggleSubmenu(item: MenuItem): void {
    item.expanded = !item.expanded;
  }
}
