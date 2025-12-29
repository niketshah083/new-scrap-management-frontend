import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth.model';
import {
  TenantUser,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<TenantUser[]>> {
    return this.http.get<ApiResponse<TenantUser[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<TenantUser>> {
    return this.http.get<ApiResponse<TenantUser>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateUserRequest): Observable<ApiResponse<TenantUser>> {
    return this.http.post<ApiResponse<TenantUser>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateUserRequest): Observable<ApiResponse<TenantUser>> {
    return this.http.put<ApiResponse<TenantUser>>(`${this.apiUrl}/${id}`, data);
  }

  updateRole(id: number, data: UpdateUserRoleRequest): Observable<ApiResponse<TenantUser>> {
    return this.http.put<ApiResponse<TenantUser>>(`${this.apiUrl}/${id}/role`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  resetPassword(id: number, data: ResetPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${id}/reset-password`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/me/change-password`, data);
  }
}
