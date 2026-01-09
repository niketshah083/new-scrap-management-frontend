import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.model';
import {
  DeliveryOrder,
  CreateDeliveryOrderRequest,
  UpdateDeliveryOrderRequest,
} from './delivery-order.model';

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
