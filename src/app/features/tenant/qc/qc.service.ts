import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  QCInspection,
  CreateQCInspectionRequest,
  UpdateQCInspectionRequest,
  CompleteQCInspectionRequest,
  QCStats,
} from './qc.model';

@Injectable({
  providedIn: 'root',
})
export class QCService {
  private apiUrl = `${environment.apiUrl}/qc`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<QCInspection[]>> {
    return this.http.get<ApiResponse<QCInspection[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<QCInspection>> {
    return this.http.get<ApiResponse<QCInspection>>(`${this.apiUrl}/${id}`);
  }

  getPending(): Observable<ApiResponse<QCInspection[]>> {
    return this.http.get<ApiResponse<QCInspection[]>>(`${this.apiUrl}/pending`);
  }

  getPendingCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/count/pending`);
  }

  getStats(): Observable<ApiResponse<QCStats>> {
    return this.http.get<ApiResponse<QCStats>>(`${this.apiUrl}/stats`);
  }

  getByStatus(status: string): Observable<ApiResponse<QCInspection[]>> {
    return this.http.get<ApiResponse<QCInspection[]>>(`${this.apiUrl}/status/${status}`);
  }

  getByMaterial(materialId: number): Observable<ApiResponse<QCInspection[]>> {
    return this.http.get<ApiResponse<QCInspection[]>>(`${this.apiUrl}/material/${materialId}`);
  }

  getByVendor(vendorId: number): Observable<ApiResponse<QCInspection[]>> {
    return this.http.get<ApiResponse<QCInspection[]>>(`${this.apiUrl}/vendor/${vendorId}`);
  }

  getByDateRange(startDate: string, endDate: string): Observable<ApiResponse<QCInspection[]>> {
    return this.http.get<ApiResponse<QCInspection[]>>(
      `${this.apiUrl}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getReport(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/report`);
  }

  create(data: CreateQCInspectionRequest): Observable<ApiResponse<QCInspection>> {
    return this.http.post<ApiResponse<QCInspection>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateQCInspectionRequest): Observable<ApiResponse<QCInspection>> {
    return this.http.put<ApiResponse<QCInspection>>(`${this.apiUrl}/${id}`, data);
  }

  complete(id: number, data: CompleteQCInspectionRequest): Observable<ApiResponse<QCInspection>> {
    return this.http.put<ApiResponse<QCInspection>>(`${this.apiUrl}/${id}/complete`, data);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
