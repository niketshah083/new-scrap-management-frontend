import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';
import { Material, CreateMaterialRequest, UpdateMaterialRequest } from './material.model';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private apiUrl = `${environment.apiUrl}/materials`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Material[]>> {
    return this.http.get<ApiResponse<Material[]>>(this.apiUrl);
  }

  getActive(): Observable<ApiResponse<Material[]>> {
    return this.http.get<ApiResponse<Material[]>>(`${this.apiUrl}/active`);
  }

  getByCategory(category: string): Observable<ApiResponse<Material[]>> {
    return this.http.get<ApiResponse<Material[]>>(`${this.apiUrl}/category?category=${category}`);
  }

  getById(id: number): Observable<ApiResponse<Material>> {
    return this.http.get<ApiResponse<Material>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateMaterialRequest): Observable<ApiResponse<Material>> {
    return this.http.post<ApiResponse<Material>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateMaterialRequest): Observable<ApiResponse<Material>> {
    return this.http.put<ApiResponse<Material>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<ApiResponse<Material>> {
    return this.http.patch<ApiResponse<Material>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
