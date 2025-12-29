import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/models/api-response.model';

export interface DashboardSummary {
  todayGRNStats: { status: string; count: number }[];
  pendingQCCount: number;
  activeGatePassCount: number;
  recentActivity: any[];
  // New metrics
  totalGRNsThisMonth: number;
  totalWeightThisMonth: number;
  vendorCount: number;
  materialCount: number;
  qcPassRate: number;
  avgProcessingTime: number;
  weeklyTrend: { date: string; count: number; weight: number }[];
  topVendors: { vendorId: number; vendorName: string; grnCount: number; totalWeight: number }[];
  grnByStep: { step: number; count: number }[];
  expiredGatePassCount: number;
  pendingPOCount: number;
}

export interface GRNStats {
  total: number;
  byStatus: { status: string; count: number }[];
  byDay: { date: string; count: number }[];
}

export interface MenuItem {
  module: string;
  operations: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.apiUrl}/summary`);
  }

  getTodayGRNStats(): Observable<ApiResponse<{ status: string; count: number }[]>> {
    return this.http.get<ApiResponse<{ status: string; count: number }[]>>(
      `${this.apiUrl}/grn/today`
    );
  }

  getPendingQCCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/qc/pending-count`);
  }

  getActiveGatePassCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/gate-pass/active-count`);
  }

  getRecentGRNActivity(limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/grn/recent?limit=${limit}`);
  }

  getUserMenuItems(): Observable<ApiResponse<MenuItem[]>> {
    return this.http.get<ApiResponse<MenuItem[]>>(`${this.apiUrl}/menu`);
  }

  getGRNStatsByDateRange(startDate: string, endDate: string): Observable<ApiResponse<GRNStats>> {
    return this.http.get<ApiResponse<GRNStats>>(
      `${this.apiUrl}/grn/stats?startDate=${startDate}&endDate=${endDate}`
    );
  }
}
