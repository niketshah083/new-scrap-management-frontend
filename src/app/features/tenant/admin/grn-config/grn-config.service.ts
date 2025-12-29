import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth.model';

export type FieldType = 'text' | 'number' | 'date' | 'file' | 'photo' | 'dropdown';

export interface GRNFieldConfig {
  id: number;
  stepNumber: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  isRequired: boolean;
  displayOrder: number;
  options?: string[];
  allowMultiple: boolean;
  maxFiles: number;
  isActive: boolean;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGRNFieldConfigRequest {
  stepNumber: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  isRequired?: boolean;
  displayOrder?: number;
  options?: string[];
  allowMultiple?: boolean;
  maxFiles?: number;
}

export interface UpdateGRNFieldConfigRequest {
  fieldLabel?: string;
  fieldType?: FieldType;
  isRequired?: boolean;
  displayOrder?: number;
  options?: string[];
  allowMultiple?: boolean;
  maxFiles?: number;
}

@Injectable({
  providedIn: 'root',
})
export class GrnConfigService {
  private apiUrl = `${environment.apiUrl}/grn-field-config`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<GRNFieldConfig[]>> {
    return this.http.get<ApiResponse<GRNFieldConfig[]>>(this.apiUrl);
  }

  getByStep(stepNumber: number): Observable<ApiResponse<GRNFieldConfig[]>> {
    return this.http.get<ApiResponse<GRNFieldConfig[]>>(`${this.apiUrl}/step/${stepNumber}`);
  }

  getById(id: number): Observable<ApiResponse<GRNFieldConfig>> {
    return this.http.get<ApiResponse<GRNFieldConfig>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateGRNFieldConfigRequest): Observable<ApiResponse<GRNFieldConfig>> {
    return this.http.post<ApiResponse<GRNFieldConfig>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateGRNFieldConfigRequest): Observable<ApiResponse<GRNFieldConfig>> {
    return this.http.put<ApiResponse<GRNFieldConfig>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<ApiResponse<GRNFieldConfig>> {
    return this.http.patch<ApiResponse<GRNFieldConfig>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  reorderFields(stepNumber: number, fieldIds: number[]): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/step/${stepNumber}/reorder`, {
      fieldIds,
    });
  }

  initializeDefaults(): Observable<ApiResponse<GRNFieldConfig[]>> {
    return this.http.post<ApiResponse<GRNFieldConfig[]>>(`${this.apiUrl}/initialize-defaults`, {});
  }
}
