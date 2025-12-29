import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';
import {
  SuperAdmin,
  CreateSuperAdminRequest,
  UpdateSuperAdminRequest,
  ResetPasswordRequest,
} from './super-admin.model';

@Injectable({
  providedIn: 'root',
})
export class SuperAdminService {
  private apiUrl = `${environment.apiUrl}/users/super-admin`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<SuperAdmin[]>> {
    return this.http.get<ApiResponse<SuperAdmin[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<SuperAdmin>> {
    return this.http.get<ApiResponse<SuperAdmin>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateSuperAdminRequest): Observable<ApiResponse<SuperAdmin>> {
    return this.http.post<ApiResponse<SuperAdmin>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateSuperAdminRequest): Observable<ApiResponse<SuperAdmin>> {
    return this.http.put<ApiResponse<SuperAdmin>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  resetPassword(id: number, data: ResetPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${id}/reset-password`, data);
  }
}
