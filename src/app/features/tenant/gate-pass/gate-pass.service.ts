import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  GatePass,
  CreateGatePassRequest,
  VerifyGatePassRequest,
  MarkGatePassUsedRequest,
  GatePassVerifyResult,
} from './gate-pass.model';

@Injectable({
  providedIn: 'root',
})
export class GatePassService {
  private apiUrl = `${environment.apiUrl}/gate-pass`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<GatePass[]>> {
    return this.http.get<ApiResponse<GatePass[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<GatePass>> {
    return this.http.get<ApiResponse<GatePass>>(`${this.apiUrl}/${id}`);
  }

  getByGrnId(grnId: number): Observable<ApiResponse<GatePass | null>> {
    return this.http.get<ApiResponse<GatePass | null>>(`${this.apiUrl}/by-grn/${grnId}`);
  }

  getActive(): Observable<ApiResponse<GatePass[]>> {
    return this.http.get<ApiResponse<GatePass[]>>(`${this.apiUrl}/active`);
  }

  getExpired(): Observable<ApiResponse<GatePass[]>> {
    return this.http.get<ApiResponse<GatePass[]>>(`${this.apiUrl}/expired`);
  }

  getActiveCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/count/active`);
  }

  create(data: CreateGatePassRequest): Observable<ApiResponse<GatePass>> {
    return this.http.post<ApiResponse<GatePass>>(this.apiUrl, data);
  }

  verify(data: VerifyGatePassRequest): Observable<ApiResponse<GatePassVerifyResult>> {
    return this.http.post<ApiResponse<GatePassVerifyResult>>(`${this.apiUrl}/verify`, data);
  }

  markAsUsed(id: number, data?: MarkGatePassUsedRequest): Observable<ApiResponse<GatePass>> {
    return this.http.put<ApiResponse<GatePass>>(`${this.apiUrl}/${id}/use`, data || {});
  }

  updateExpiredPasses(): Observable<ApiResponse<{ updatedCount: number }>> {
    return this.http.post<ApiResponse<{ updatedCount: number }>>(
      `${this.apiUrl}/update-expired`,
      {}
    );
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
