import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: Date;
  link?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  public unreadCount$ = this.unreadCountSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadUnreadCount(): void {
    this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/unread/count`).subscribe({
      next: (response) => {
        if (response.success && response.data !== undefined) {
          this.unreadCountSubject.next(response.data.count);
        }
      },
      error: () => {
        this.unreadCountSubject.next(0);
      },
    });
  }

  loadNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(this.apiUrl).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.notificationsSubject.next(response.data);
        }
      })
    );
  }

  markAsRead(id: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap((response) => {
        if (response.success) {
          const notifications = this.notificationsSubject.value.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
        }
      })
    );
  }

  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/read-all`, {}).pipe(
      tap((response) => {
        if (response.success) {
          const notifications = this.notificationsSubject.value.map((n) => ({
            ...n,
            isRead: true,
          }));
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(0);
        }
      })
    );
  }

  clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }
}
