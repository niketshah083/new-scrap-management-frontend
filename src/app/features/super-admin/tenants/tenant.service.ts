import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';
import {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  AssignSubscriptionRequest,
} from './tenant.model';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private apiUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Tenant[]>> {
    return this.http.get<ApiResponse<Tenant[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Tenant>> {
    return this.http.get<ApiResponse<Tenant>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateTenantRequest): Observable<ApiResponse<Tenant>> {
    return this.http.post<ApiResponse<Tenant>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateTenantRequest): Observable<ApiResponse<Tenant>> {
    return this.http.put<ApiResponse<Tenant>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  assignSubscription(
    tenantId: number,
    data: AssignSubscriptionRequest
  ): Observable<ApiResponse<Tenant>> {
    return this.http.post<ApiResponse<Tenant>>(`${this.apiUrl}/${tenantId}/subscription`, data);
  }

  toggleStatus(id: number): Observable<ApiResponse<Tenant>> {
    return this.http.patch<ApiResponse<Tenant>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
