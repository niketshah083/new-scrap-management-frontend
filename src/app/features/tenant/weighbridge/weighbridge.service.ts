import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  WeighbridgeMaster,
  CreateWeighbridgeMasterRequest,
  UpdateWeighbridgeMasterRequest,
  WeighbridgeConfig,
  CreateWeighbridgeConfigRequest,
  UpdateWeighbridgeConfigRequest,
} from './weighbridge.model';

@Injectable({
  providedIn: 'root',
})
export class WeighbridgeService {
  private apiUrl = `${environment.apiUrl}/weighbridge`;

  constructor(private http: HttpClient) {}

  // WeighbridgeMaster API methods

  getAllMasters(): Observable<ApiResponse<WeighbridgeMaster[]>> {
    return this.http.get<ApiResponse<WeighbridgeMaster[]>>(`${this.apiUrl}/masters`);
  }

  getActiveMasters(): Observable<ApiResponse<WeighbridgeMaster[]>> {
    return this.http.get<ApiResponse<WeighbridgeMaster[]>>(`${this.apiUrl}/masters/active`);
  }

  getMasterById(id: number): Observable<ApiResponse<WeighbridgeMaster>> {
    return this.http.get<ApiResponse<WeighbridgeMaster>>(`${this.apiUrl}/masters/${id}`);
  }

  createMaster(data: CreateWeighbridgeMasterRequest): Observable<ApiResponse<WeighbridgeMaster>> {
    return this.http.post<ApiResponse<WeighbridgeMaster>>(`${this.apiUrl}/masters`, data);
  }

  updateMaster(
    id: number,
    data: UpdateWeighbridgeMasterRequest
  ): Observable<ApiResponse<WeighbridgeMaster>> {
    return this.http.put<ApiResponse<WeighbridgeMaster>>(`${this.apiUrl}/masters/${id}`, data);
  }

  deleteMaster(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/masters/${id}`);
  }

  toggleMasterStatus(id: number): Observable<ApiResponse<WeighbridgeMaster>> {
    return this.http.patch<ApiResponse<WeighbridgeMaster>>(
      `${this.apiUrl}/masters/${id}/toggle-status`,
      {}
    );
  }

  // WeighbridgeConfig API methods

  getAllConfigs(): Observable<ApiResponse<WeighbridgeConfig[]>> {
    return this.http.get<ApiResponse<WeighbridgeConfig[]>>(`${this.apiUrl}/configs`);
  }

  getConfigById(id: number): Observable<ApiResponse<WeighbridgeConfig>> {
    return this.http.get<ApiResponse<WeighbridgeConfig>>(`${this.apiUrl}/configs/${id}`);
  }

  getConfigByMasterId(masterId: number): Observable<ApiResponse<WeighbridgeConfig>> {
    return this.http.get<ApiResponse<WeighbridgeConfig>>(
      `${this.apiUrl}/configs/master/${masterId}`
    );
  }

  createConfig(data: CreateWeighbridgeConfigRequest): Observable<ApiResponse<WeighbridgeConfig>> {
    return this.http.post<ApiResponse<WeighbridgeConfig>>(`${this.apiUrl}/configs`, data);
  }

  updateConfig(
    id: number,
    data: UpdateWeighbridgeConfigRequest
  ): Observable<ApiResponse<WeighbridgeConfig>> {
    return this.http.put<ApiResponse<WeighbridgeConfig>>(`${this.apiUrl}/configs/${id}`, data);
  }

  deleteConfig(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/configs/${id}`);
  }

  toggleConfigStatus(id: number): Observable<ApiResponse<WeighbridgeConfig>> {
    return this.http.patch<ApiResponse<WeighbridgeConfig>>(
      `${this.apiUrl}/configs/${id}/toggle-status`,
      {}
    );
  }
}
