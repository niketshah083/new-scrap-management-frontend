import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';
import { Vendor, CreateVendorRequest, UpdateVendorRequest } from './vendor.model';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private apiUrl = `${environment.apiUrl}/vendors`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Vendor[]>> {
    return this.http.get<ApiResponse<Vendor[]>>(this.apiUrl);
  }

  getActive(): Observable<ApiResponse<Vendor[]>> {
    return this.http.get<ApiResponse<Vendor[]>>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<ApiResponse<Vendor>> {
    return this.http.get<ApiResponse<Vendor>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateVendorRequest): Observable<ApiResponse<Vendor>> {
    return this.http.post<ApiResponse<Vendor>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateVendorRequest): Observable<ApiResponse<Vendor>> {
    return this.http.put<ApiResponse<Vendor>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<ApiResponse<Vendor>> {
    return this.http.patch<ApiResponse<Vendor>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
