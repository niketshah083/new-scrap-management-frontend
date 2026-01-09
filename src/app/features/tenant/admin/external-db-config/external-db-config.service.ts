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
  externalDbDeliveryOrderTable: string | null;
  externalDbDeliveryOrderItemTable: string | null;
  externalDbTransporterTable: string | null;
  externalDbDoItemRelationKey: string | null;
  externalDbCacheTtl: number | null;
  externalDbVendorMappings: FieldMapping[] | null;
  externalDbPoMappings: FieldMapping[] | null;
  externalDbMaterialMappings: FieldMapping[] | null;
  externalDbDeliveryOrderMappings: FieldMapping[] | null;
  externalDbDeliveryOrderItemMappings: FieldMapping[] | null;
  externalDbTransporterMappings: FieldMapping[] | null;
  // Vendor join configuration for DO
  externalDbDoVendorTable: string | null;
  externalDbDoVendorFk: string | null;
  externalDbDoVendorPk: string | null;
  externalDbDoVendorNameField: string | null;
  // Material join configuration for DO items
  externalDbDoItemMaterialTable: string | null;
  externalDbDoItemMaterialFk: string | null;
  externalDbDoItemMaterialPk: string | null;
  externalDbDoItemMaterialNameField: string | null;
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
  externalDbDeliveryOrderTable?: string;
  externalDbDeliveryOrderItemTable?: string;
  externalDbTransporterTable?: string;
  externalDbDoItemRelationKey?: string;
  externalDbCacheTtl?: number;
  externalDbVendorMappings?: FieldMapping[];
  externalDbPoMappings?: FieldMapping[];
  externalDbMaterialMappings?: FieldMapping[];
  externalDbDeliveryOrderMappings?: FieldMapping[];
  externalDbDeliveryOrderItemMappings?: FieldMapping[];
  externalDbTransporterMappings?: FieldMapping[];
  // Vendor join configuration for DO
  externalDbDoVendorTable?: string;
  externalDbDoVendorFk?: string;
  externalDbDoVendorPk?: string;
  externalDbDoVendorNameField?: string;
  // Material join configuration for DO items
  externalDbDoItemMaterialTable?: string;
  externalDbDoItemMaterialFk?: string;
  externalDbDoItemMaterialPk?: string;
  externalDbDoItemMaterialNameField?: string;
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

  // Self-service endpoints for tenant users (uses current tenant from auth token)
  getConfig(_tenantId?: number): Observable<ApiResponse<ExternalDbConfig>> {
    return this.http.get<ApiResponse<ExternalDbConfig>>(`${this.apiUrl}/my/external-db-config`);
  }

  updateConfig(
    _tenantId: number,
    data: UpdateExternalDbConfigRequest
  ): Observable<ApiResponse<ExternalDbConfig>> {
    return this.http.put<ApiResponse<ExternalDbConfig>>(
      `${this.apiUrl}/my/external-db-config`,
      data
    );
  }

  testConnection(_tenantId?: number): Observable<ApiResponse<ConnectionTestResult>> {
    return this.http.post<ApiResponse<ConnectionTestResult>>(
      `${this.apiUrl}/my/external-db-config/test`,
      {}
    );
  }

  // Super Admin endpoints for managing specific tenant's config
  getConfigByTenantId(tenantId: number): Observable<ApiResponse<ExternalDbConfig>> {
    return this.http.get<ApiResponse<ExternalDbConfig>>(
      `${this.apiUrl}/${tenantId}/external-db-config`
    );
  }

  updateConfigByTenantId(
    tenantId: number,
    data: UpdateExternalDbConfigRequest
  ): Observable<ApiResponse<ExternalDbConfig>> {
    return this.http.put<ApiResponse<ExternalDbConfig>>(
      `${this.apiUrl}/${tenantId}/external-db-config`,
      data
    );
  }

  testConnectionByTenantId(tenantId: number): Observable<ApiResponse<ConnectionTestResult>> {
    return this.http.post<ApiResponse<ConnectionTestResult>>(
      `${this.apiUrl}/${tenantId}/external-db-config/test`,
      {}
    );
  }
}
