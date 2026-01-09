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
          permission: `${ModuleCode.Dashboard}:${OperationCode.Read}`,
        },
        {
          label: 'GRN',
          icon: 'pi pi-file',
          route: '/grn',
          permission: `${ModuleCode.GRN}:${OperationCode.List}`,
        },
        {
          label: 'Gate Pass',
          icon: 'pi pi-id-card',
          route: '/gate-pass',
          permission: `${ModuleCode.GatePass}:${OperationCode.List}`,
        },
        {
          label: 'QC Inspection',
          icon: 'pi pi-check-circle',
          route: '/qc',
          permission: `${ModuleCode.QC}:${OperationCode.List}`,
        },
        {
          label: 'Vendors',
          icon: 'pi pi-users',
          route: '/vendors',
          permission: `${ModuleCode.Vendor}:${OperationCode.List}`,
        },
        {
          label: 'Materials',
          icon: 'pi pi-box',
          route: '/materials',
          permission: `${ModuleCode.Material}:${OperationCode.List}`,
        },
        {
          label: 'Purchase Orders',
          icon: 'pi pi-shopping-cart',
          route: '/purchase-orders',
          permission: `${ModuleCode.PurchaseOrder}:${OperationCode.List}`,
        },
        {
          label: 'Delivery Orders',
          icon: 'pi pi-truck',
          route: '/delivery-orders',
          permission: `${ModuleCode.DeliveryOrder}:${OperationCode.List}`,
        },
        {
          label: 'Users',
          icon: 'pi pi-user',
          route: '/users',
          permission: `${ModuleCode.User}:${OperationCode.List}`,
        },
        {
          label: 'Roles',
          icon: 'pi pi-shield',
          route: '/roles',
          permission: `${ModuleCode.Role}:${OperationCode.List}`,
        },
        {
          label: 'GRN Config',
          icon: 'pi pi-cog',
          route: '/grn-config',
          permission: `${ModuleCode.GRNFieldConfig}:${OperationCode.List}`,
        },
        {
          label: 'External DB',
          icon: 'pi pi-database',
          route: '/admin/external-db',
          permission: `${ModuleCode.ExternalDbConfig}:${OperationCode.Read}`,
        },
        {
          label: 'RFID Cards',
          icon: 'pi pi-wifi',
          route: '/admin/rfid-cards',
          // No permission check for now - new module
        },
        {
          label: 'Weighbridge',
          icon: 'pi pi-server',
          route: '/weighbridge',
          permission: `${ModuleCode.Weighbridge}:${OperationCode.List}`,
        },
        {
          label: 'Camera',
          icon: 'pi pi-video',
          route: '/camera',
          permission: `${ModuleCode.Camera}:${OperationCode.List}`,
        },
        {
          label: 'Transporters',
          icon: 'pi pi-truck',
          route: '/transporters',
          permission: `${ModuleCode.Transporter}:${OperationCode.List}`,
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
