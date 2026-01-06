import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  CameraMaster,
  CreateCameraMasterRequest,
  UpdateCameraMasterRequest,
  CameraConfig,
  CreateCameraConfigRequest,
  UpdateCameraConfigRequest,
} from './camera.model';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  private apiUrl = `${environment.apiUrl}/camera`;

  constructor(private http: HttpClient) {}

  // CameraMaster API methods

  getAllMasters(): Observable<ApiResponse<CameraMaster[]>> {
    return this.http.get<ApiResponse<CameraMaster[]>>(`${this.apiUrl}/masters`);
  }

  getActiveMasters(): Observable<ApiResponse<CameraMaster[]>> {
    return this.http.get<ApiResponse<CameraMaster[]>>(`${this.apiUrl}/masters/active`);
  }

  getMasterById(id: number): Observable<ApiResponse<CameraMaster>> {
    return this.http.get<ApiResponse<CameraMaster>>(`${this.apiUrl}/masters/${id}`);
  }

  createMaster(data: CreateCameraMasterRequest): Observable<ApiResponse<CameraMaster>> {
    return this.http.post<ApiResponse<CameraMaster>>(`${this.apiUrl}/masters`, data);
  }

  updateMaster(id: number, data: UpdateCameraMasterRequest): Observable<ApiResponse<CameraMaster>> {
    return this.http.put<ApiResponse<CameraMaster>>(`${this.apiUrl}/masters/${id}`, data);
  }

  deleteMaster(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/masters/${id}`);
  }

  toggleMasterStatus(id: number): Observable<ApiResponse<CameraMaster>> {
    return this.http.patch<ApiResponse<CameraMaster>>(
      `${this.apiUrl}/masters/${id}/toggle-status`,
      {}
    );
  }

  // CameraConfig API methods

  getAllConfigs(): Observable<ApiResponse<CameraConfig[]>> {
    return this.http.get<ApiResponse<CameraConfig[]>>(`${this.apiUrl}/configs`);
  }

  getConfigById(id: number): Observable<ApiResponse<CameraConfig>> {
    return this.http.get<ApiResponse<CameraConfig>>(`${this.apiUrl}/configs/${id}`);
  }

  getConfigByMasterId(masterId: number): Observable<ApiResponse<CameraConfig>> {
    return this.http.get<ApiResponse<CameraConfig>>(`${this.apiUrl}/configs/master/${masterId}`);
  }

  createConfig(data: CreateCameraConfigRequest): Observable<ApiResponse<CameraConfig>> {
    return this.http.post<ApiResponse<CameraConfig>>(`${this.apiUrl}/configs`, data);
  }

  updateConfig(id: number, data: UpdateCameraConfigRequest): Observable<ApiResponse<CameraConfig>> {
    return this.http.put<ApiResponse<CameraConfig>>(`${this.apiUrl}/configs/${id}`, data);
  }

  deleteConfig(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/configs/${id}`);
  }

  toggleConfigStatus(id: number): Observable<ApiResponse<CameraConfig>> {
    return this.http.patch<ApiResponse<CameraConfig>>(
      `${this.apiUrl}/configs/${id}/toggle-status`,
      {}
    );
  }
}
