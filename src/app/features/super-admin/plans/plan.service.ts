import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';
import {
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanModule,
  AssignModulesRequest,
} from './plan.model';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private apiUrl = `${environment.apiUrl}/plans`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Plan[]>> {
    return this.http.get<ApiResponse<Plan[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Plan>> {
    return this.http.get<ApiResponse<Plan>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreatePlanRequest): Observable<ApiResponse<Plan>> {
    return this.http.post<ApiResponse<Plan>>(this.apiUrl, data);
  }

  update(id: number, data: UpdatePlanRequest): Observable<ApiResponse<Plan>> {
    return this.http.put<ApiResponse<Plan>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  assignModules(id: number, data: AssignModulesRequest): Observable<ApiResponse<Plan>> {
    return this.http.post<ApiResponse<Plan>>(`${this.apiUrl}/${id}/modules`, data);
  }

  removeModules(id: number, data: AssignModulesRequest): Observable<ApiResponse<Plan>> {
    return this.http.delete<ApiResponse<Plan>>(`${this.apiUrl}/${id}/modules`, { body: data });
  }

  toggleStatus(id: number): Observable<ApiResponse<Plan>> {
    return this.http.patch<ApiResponse<Plan>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  getAvailableModules(): Observable<ApiResponse<PlanModule[]>> {
    return this.http.get<ApiResponse<PlanModule[]>>(`${environment.apiUrl}/modules`);
  }
}
