import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-response.model';
import {
  DoProcessing,
  DoProcessingStats,
  DoProcessingStatus,
  StartDoProcessingRequest,
  GateEntryRequest,
  InitialWeighingRequest,
  ItemTareWeightRequest,
  ItemGrossWeightRequest,
  FinalWeighingRequest,
} from './do-processing.model';

@Injectable({
  providedIn: 'root',
})
export class DoProcessingService {
  private apiUrl = `${environment.apiUrl}/do-processing`;

  constructor(private http: HttpClient) {}

  // Get all processing records
  getAll(status?: DoProcessingStatus): Observable<ApiResponse<DoProcessing[]>> {
    const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
    return this.http.get<ApiResponse<DoProcessing[]>>(url);
  }

  // Get in-progress records
  getInProgress(): Observable<ApiResponse<DoProcessing[]>> {
    return this.http.get<ApiResponse<DoProcessing[]>>(`${this.apiUrl}/in-progress`);
  }

  // Get stats
  getStats(): Observable<ApiResponse<DoProcessingStats>> {
    return this.http.get<ApiResponse<DoProcessingStats>>(`${this.apiUrl}/stats`);
  }

  // Get by ID
  getById(id: number): Observable<ApiResponse<DoProcessing>> {
    return this.http.get<ApiResponse<DoProcessing>>(`${this.apiUrl}/${id}`);
  }

  // Get by DO number
  getByDoNumber(doNumber: string): Observable<ApiResponse<DoProcessing>> {
    return this.http.get<ApiResponse<DoProcessing>>(`${this.apiUrl}/by-do/${doNumber}`);
  }

  // Start processing
  startProcessing(data: StartDoProcessingRequest): Observable<ApiResponse<DoProcessing>> {
    return this.http.post<ApiResponse<DoProcessing>>(`${this.apiUrl}/start`, data);
  }

  // Step 1: Gate Entry
  recordGateEntry(id: number, data: GateEntryRequest): Observable<ApiResponse<DoProcessing>> {
    return this.http.put<ApiResponse<DoProcessing>>(`${this.apiUrl}/${id}/gate-entry`, data);
  }

  // Step 2: Initial Weighing
  recordInitialWeighing(
    id: number,
    data: InitialWeighingRequest
  ): Observable<ApiResponse<DoProcessing>> {
    return this.http.put<ApiResponse<DoProcessing>>(`${this.apiUrl}/${id}/initial-weighing`, data);
  }

  // Step 4: Item Tare Weight
  recordItemTareWeight(
    id: number,
    data: ItemTareWeightRequest
  ): Observable<ApiResponse<DoProcessing>> {
    return this.http.put<ApiResponse<DoProcessing>>(`${this.apiUrl}/${id}/item-tare-weight`, data);
  }

  // Step 5/6: Item Gross Weight
  recordItemGrossWeight(
    id: number,
    data: ItemGrossWeightRequest
  ): Observable<ApiResponse<DoProcessing>> {
    return this.http.put<ApiResponse<DoProcessing>>(`${this.apiUrl}/${id}/item-gross-weight`, data);
  }

  // Mark item as loaded (ready for weighing)
  markItemAsLoaded(id: number, itemId: number): Observable<ApiResponse<DoProcessing>> {
    return this.http.put<ApiResponse<DoProcessing>>(
      `${this.apiUrl}/${id}/mark-item-loaded/${itemId}`,
      {}
    );
  }

  // Record item weight (combined tare and gross)
  recordItemWeight(id: number, data: any): Observable<ApiResponse<DoProcessing>> {
    return this.http.put<ApiResponse<DoProcessing>>(
      `${this.apiUrl}/${id}/record-item-weight`,
      data
    );
  }

  // Skip item
  skipItem(id: number, itemId: number, remarks: string): Observable<ApiResponse<DoProcessing>> {
    return this.http.put<ApiResponse<DoProcessing>>(`${this.apiUrl}/${id}/skip-item/${itemId}`, {
      remarks,
    });
  }

  // Step 8: Final Weighing
  recordFinalWeighing(
    id: number,
    data: FinalWeighingRequest
  ): Observable<ApiResponse<DoProcessing>> {
    return this.http.put<ApiResponse<DoProcessing>>(`${this.apiUrl}/${id}/final-weighing`, data);
  }

  // Cancel processing
  cancelProcessing(id: number, remarks: string): Observable<ApiResponse<DoProcessing>> {
    return this.http.put<ApiResponse<DoProcessing>>(`${this.apiUrl}/${id}/cancel`, { remarks });
  }
}
