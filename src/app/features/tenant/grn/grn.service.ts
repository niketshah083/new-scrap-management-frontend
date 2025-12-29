import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';
import {
  GRN,
  GRNFieldConfig,
  CreateGRNRequest,
  UpdateGRNStep2Request,
  UpdateGRNStep3Request,
  UpdateGRNStep4Request,
  UpdateGRNStep5Request,
} from './grn.model';

@Injectable({
  providedIn: 'root',
})
export class GrnService {
  private apiUrl = `${environment.apiUrl}/grn`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<GRN[]>> {
    return this.http.get<ApiResponse<GRN[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<GRN>> {
    return this.http.get<ApiResponse<GRN>>(`${this.apiUrl}/${id}`);
  }

  getByStatus(status: string): Observable<ApiResponse<GRN[]>> {
    return this.http.get<ApiResponse<GRN[]>>(`${this.apiUrl}/status/${status}`);
  }

  getByStep(step: number): Observable<ApiResponse<GRN[]>> {
    return this.http.get<ApiResponse<GRN[]>>(`${this.apiUrl}/step/${step}`);
  }

  getPendingApproval(): Observable<ApiResponse<GRN[]>> {
    return this.http.get<ApiResponse<GRN[]>>(`${this.apiUrl}/pending-approval`);
  }

  getApproved(): Observable<ApiResponse<GRN[]>> {
    return this.http.get<ApiResponse<GRN[]>>(`${this.apiUrl}/approved`);
  }

  getTodayStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats/today`);
  }

  create(data: CreateGRNRequest): Observable<ApiResponse<GRN>> {
    return this.http.post<ApiResponse<GRN>>(this.apiUrl, data);
  }

  updateStep2(id: number, data: UpdateGRNStep2Request): Observable<ApiResponse<GRN>> {
    return this.http.put<ApiResponse<GRN>>(`${this.apiUrl}/${id}/step2`, data);
  }

  updateStep3(id: number, data: UpdateGRNStep3Request): Observable<ApiResponse<GRN>> {
    return this.http.put<ApiResponse<GRN>>(`${this.apiUrl}/${id}/step3`, data);
  }

  updateStep4(id: number, data: UpdateGRNStep4Request): Observable<ApiResponse<GRN>> {
    return this.http.put<ApiResponse<GRN>>(`${this.apiUrl}/${id}/step4`, data);
  }

  updateStep5(id: number, data: UpdateGRNStep5Request): Observable<ApiResponse<GRN>> {
    return this.http.put<ApiResponse<GRN>>(`${this.apiUrl}/${id}/step5`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getFieldConfigs(step: number): Observable<ApiResponse<GRNFieldConfig[]>> {
    return this.http.get<ApiResponse<GRNFieldConfig[]>>(
      `${environment.apiUrl}/grn-field-config/step/${step}`
    );
  }

  uploadFile(file: File): Observable<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<{ url: string }>>(`${environment.apiUrl}/uploads`, formData);
  }
}
