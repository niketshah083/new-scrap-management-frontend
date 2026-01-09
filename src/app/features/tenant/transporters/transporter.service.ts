import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';
import {
  Transporter,
  CreateTransporterRequest,
  UpdateTransporterRequest,
} from './transporter.model';

@Injectable({
  providedIn: 'root',
})
export class TransporterService {
  private apiUrl = `${environment.apiUrl}/transporters`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Transporter[]>> {
    return this.http.get<ApiResponse<Transporter[]>>(this.apiUrl);
  }

  getActive(): Observable<ApiResponse<Transporter[]>> {
    return this.http.get<ApiResponse<Transporter[]>>(`${this.apiUrl}/active`);
  }

  getById(id: number | string): Observable<ApiResponse<Transporter>> {
    return this.http.get<ApiResponse<Transporter>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateTransporterRequest): Observable<ApiResponse<Transporter>> {
    return this.http.post<ApiResponse<Transporter>>(this.apiUrl, data);
  }

  update(
    id: number | string,
    data: UpdateTransporterRequest
  ): Observable<ApiResponse<Transporter>> {
    return this.http.put<ApiResponse<Transporter>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number | string): Observable<ApiResponse<Transporter>> {
    return this.http.patch<ApiResponse<Transporter>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
