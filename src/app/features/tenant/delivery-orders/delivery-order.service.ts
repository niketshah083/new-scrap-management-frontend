import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';
import {
  DeliveryOrder,
  CreateDeliveryOrderRequest,
  UpdateDeliveryOrderRequest,
} from './delivery-order.model';

export interface DeliveryOrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  vendorId?: number;
  processingStatus?: string;
  startDate?: string;
  endDate?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DeliveryOrderService {
  private apiUrl = `${environment.apiUrl}/delivery-orders`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<DeliveryOrder[]>> {
    return this.http.get<ApiResponse<DeliveryOrder[]>>(this.apiUrl);
  }

  getAllFromDataSource(): Observable<ApiResponse<DeliveryOrder[]>> {
    return this.http.get<ApiResponse<DeliveryOrder[]>>(`${this.apiUrl}/from-data-source`);
  }

  getAllFromDataSourcePaginated(
    params: DeliveryOrderQueryParams
  ): Observable<PaginatedResponse<DeliveryOrder>> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.vendorId) httpParams = httpParams.set('vendorId', params.vendorId.toString());
    if (params.processingStatus)
      httpParams = httpParams.set('processingStatus', params.processingStatus);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.sortField) httpParams = httpParams.set('sortField', params.sortField);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.http.get<PaginatedResponse<DeliveryOrder>>(
      `${this.apiUrl}/from-data-source/paginated`,
      { params: httpParams }
    );
  }

  getByVendor(vendorId: number): Observable<ApiResponse<DeliveryOrder[]>> {
    return this.http.get<ApiResponse<DeliveryOrder[]>>(`${this.apiUrl}/vendor/${vendorId}`);
  }

  getById(id: number): Observable<ApiResponse<DeliveryOrder>> {
    return this.http.get<ApiResponse<DeliveryOrder>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateDeliveryOrderRequest): Observable<ApiResponse<DeliveryOrder>> {
    return this.http.post<ApiResponse<DeliveryOrder>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateDeliveryOrderRequest): Observable<ApiResponse<DeliveryOrder>> {
    return this.http.put<ApiResponse<DeliveryOrder>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
