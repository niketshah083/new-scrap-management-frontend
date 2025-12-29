import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/auth.model';

export interface FieldMapping {
  internalField: string;
  externalField: string;
  transform?: 'string' | 'number' | 'date' | 'boolean';
}

export interface ExternalDbConfig {
  externalDbEnabled: boolean;
  externalDbHost: string | null;
  externalDbPort: number | null;
  externalDbName: string | null;
  externalDbUsername: string | null;
  externalDbVendorTable: string | null;
  externalDbPoTable: string | null;
  externalDbMaterialTable: string | null;
  externalDbCacheTtl: number | null;
  externalDbVendorMappings: FieldMapping[] | null;
  externalDbPoMappings: FieldMapping[] | null;
  externalDbMaterialMappings: FieldMapping[] | null;
  hasPassword: boolean;
}

export interface UpdateExternalDbConfigRequest {
  externalDbEnabled?: boolean;
  externalDbHost?: string;
  externalDbPort?: number;
  externalDbName?: string;
  externalDbUsername?: string;
  externalDbPassword?: string;
  externalDbVendorTable?: string;
  externalDbPoTable?: string;
  externalDbMaterialTable?: string;
  externalDbCacheTtl?: number;
  externalDbVendorMappings?: FieldMapping[];
  externalDbPoMappings?: FieldMapping[];
  externalDbMaterialMappings?: FieldMapping[];
}

export interface ConnectionTestResult {
  connected: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ExternalDbConfigService {
  private apiUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getConfig(tenantId: number): Observable<ApiResponse<ExternalDbConfig>> {
    return this.http.get<ApiResponse<ExternalDbConfig>>(
      `${this.apiUrl}/${tenantId}/external-db-config`
    );
  }

  updateConfig(
    tenantId: number,
    data: UpdateExternalDbConfigRequest
  ): Observable<ApiResponse<ExternalDbConfig>> {
    return this.http.put<ApiResponse<ExternalDbConfig>>(
      `${this.apiUrl}/${tenantId}/external-db-config`,
      data
    );
  }

  testConnection(tenantId: number): Observable<ApiResponse<ConnectionTestResult>> {
    return this.http.post<ApiResponse<ConnectionTestResult>>(
      `${this.apiUrl}/${tenantId}/external-db-config/test`,
      {}
    );
  }
}
