import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';

export interface Module {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface Operation {
  id: number;
  name: string;
  code: string;
}

export interface Permission {
  id: number;
  code: string;
  moduleId: number;
  operationId: number;
  module?: Module;
  operation?: Operation;
}

export interface DefaultRole {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  permissions: Permission[];
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Modules
  getModules(): Observable<ApiResponse<Module[]>> {
    return this.http.get<ApiResponse<Module[]>>(`${this.apiUrl}/modules`);
  }

  getModule(id: number): Observable<ApiResponse<Module>> {
    return this.http.get<ApiResponse<Module>>(`${this.apiUrl}/modules/${id}`);
  }

  createModule(data: Partial<Module>): Observable<ApiResponse<Module>> {
    return this.http.post<ApiResponse<Module>>(`${this.apiUrl}/modules`, data);
  }

  updateModule(id: number, data: Partial<Module>): Observable<ApiResponse<Module>> {
    return this.http.put<ApiResponse<Module>>(`${this.apiUrl}/modules/${id}`, data);
  }

  deleteModule(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/modules/${id}`);
  }

  toggleModuleStatus(id: number): Observable<ApiResponse<Module>> {
    return this.http.patch<ApiResponse<Module>>(`${this.apiUrl}/modules/${id}/toggle-status`, {});
  }

  // Operations
  getOperations(): Observable<ApiResponse<Operation[]>> {
    return this.http.get<ApiResponse<Operation[]>>(`${this.apiUrl}/operations`);
  }

  getOperation(id: number): Observable<ApiResponse<Operation>> {
    return this.http.get<ApiResponse<Operation>>(`${this.apiUrl}/operations/${id}`);
  }

  createOperation(data: Partial<Operation>): Observable<ApiResponse<Operation>> {
    return this.http.post<ApiResponse<Operation>>(`${this.apiUrl}/operations`, data);
  }

  updateOperation(id: number, data: Partial<Operation>): Observable<ApiResponse<Operation>> {
    return this.http.put<ApiResponse<Operation>>(`${this.apiUrl}/operations/${id}`, data);
  }

  deleteOperation(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/operations/${id}`);
  }

  // Permissions
  getPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.apiUrl}/permissions`);
  }

  // Default Roles
  getDefaultRoles(): Observable<ApiResponse<DefaultRole[]>> {
    return this.http.get<ApiResponse<DefaultRole[]>>(`${this.apiUrl}/default-roles`);
  }

  getDefaultRole(id: number): Observable<ApiResponse<DefaultRole>> {
    return this.http.get<ApiResponse<DefaultRole>>(`${this.apiUrl}/default-roles/${id}`);
  }

  createDefaultRole(
    data: Partial<DefaultRole> & { permissionIds?: number[] }
  ): Observable<ApiResponse<DefaultRole>> {
    return this.http.post<ApiResponse<DefaultRole>>(`${this.apiUrl}/default-roles`, data);
  }

  updateDefaultRole(
    id: number,
    data: Partial<DefaultRole> & { permissionIds?: number[] }
  ): Observable<ApiResponse<DefaultRole>> {
    return this.http.put<ApiResponse<DefaultRole>>(`${this.apiUrl}/default-roles/${id}`, data);
  }

  deleteDefaultRole(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/default-roles/${id}`);
  }

  toggleDefaultRoleStatus(id: number): Observable<ApiResponse<DefaultRole>> {
    return this.http.patch<ApiResponse<DefaultRole>>(
      `${this.apiUrl}/default-roles/${id}/toggle-status`,
      {}
    );
  }
}
