import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() sidebarCollapsed: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openNotifications = new EventEmitter<void>();

  @ViewChild('menu') menu!: Menu;

  currentUser: User | null = null;
  unreadCount: number = 0;
  userMenuItems: MenuItem[] = [];
  menuVisible: boolean = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.notificationService.unreadCount$.subscribe((count: number) => {
      this.unreadCount = count;
    });

    this.initUserMenu();
    this.loadUnreadCount();
  }

  private initUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          this.router.navigate(['/profile']);
          this.hideMenu();
        },
      },
      {
        label: 'Change Password',
        icon: 'pi pi-key',
        command: () => {
          this.router.navigate(['/change-password']);
          this.hideMenu();
        },
      },
      { separator: true },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
          this.hideMenu();
        },
      },
    ];
  }

  private loadUnreadCount(): void {
    this.notificationService.loadUnreadCount();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onOpenNotifications(): void {
    this.openNotifications.emit();
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    if (this.menuVisible) {
      this.menu.hide();
      this.menuVisible = false;
    } else {
      this.menu.show(event);
      this.menuVisible = true;
    }
  }

  hideMenu(): void {
    if (this.menu) {
      this.menu.hide();
      this.menuVisible = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Hide menu when clicking outside
    if (this.menuVisible) {
      this.hideMenu();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
