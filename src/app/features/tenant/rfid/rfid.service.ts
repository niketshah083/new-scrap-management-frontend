import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';
import {
  RFIDCard,
  CreateRFIDCardRequest,
  UpdateRFIDCardRequest,
  AssignRFIDCardRequest,
  ScanRFIDCardRequest,
  ScanRFIDCardResponse,
  AssignRFIDCardResponse,
} from './rfid-card.model';

@Injectable({
  providedIn: 'root',
})
export class RFIDService {
  private apiUrl = `${environment.apiUrl}/rfid`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<RFIDCard[]>> {
    return this.http.get<ApiResponse<RFIDCard[]>>(this.apiUrl);
  }

  getAvailable(): Observable<ApiResponse<RFIDCard[]>> {
    return this.http.get<ApiResponse<RFIDCard[]>>(`${this.apiUrl}/available`);
  }

  getById(id: number): Observable<ApiResponse<RFIDCard>> {
    return this.http.get<ApiResponse<RFIDCard>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateRFIDCardRequest): Observable<ApiResponse<RFIDCard>> {
    return this.http.post<ApiResponse<RFIDCard>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateRFIDCardRequest): Observable<ApiResponse<RFIDCard>> {
    return this.http.put<ApiResponse<RFIDCard>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  assign(data: AssignRFIDCardRequest): Observable<ApiResponse<AssignRFIDCardResponse>> {
    return this.http.post<ApiResponse<AssignRFIDCardResponse>>(`${this.apiUrl}/assign`, data);
  }

  unassign(cardNumber: string): Observable<ApiResponse<RFIDCard>> {
    return this.http.post<ApiResponse<RFIDCard>>(`${this.apiUrl}/unassign/${cardNumber}`, {});
  }

  scan(data: ScanRFIDCardRequest): Observable<ApiResponse<ScanRFIDCardResponse>> {
    return this.http.post<ApiResponse<ScanRFIDCardResponse>>(`${this.apiUrl}/scan`, data);
  }
}
