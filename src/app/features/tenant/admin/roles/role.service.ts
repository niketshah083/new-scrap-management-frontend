import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth.model';
import {
  TenantRole,
  CreateRoleRequest,
  UpdateRoleRequest,
  RolePermission,
  AssignPermissionsRequest,
} from './role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<TenantRole[]>> {
    return this.http.get<ApiResponse<TenantRole[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<TenantRole>> {
    return this.http.get<ApiResponse<TenantRole>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateRoleRequest): Observable<ApiResponse<TenantRole>> {
    return this.http.post<ApiResponse<TenantRole>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateRoleRequest): Observable<ApiResponse<TenantRole>> {
    return this.http.put<ApiResponse<TenantRole>>(`${this.apiUrl}/${id}`, data);
  }

  assignPermissions(
    id: number,
    data: AssignPermissionsRequest
  ): Observable<ApiResponse<TenantRole>> {
    return this.http.put<ApiResponse<TenantRole>>(`${this.apiUrl}/${id}/permissions`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getAvailablePermissions(): Observable<ApiResponse<RolePermission[]>> {
    return this.http.get<ApiResponse<RolePermission[]>>(`${this.apiUrl}/available-permissions`);
  }
}
