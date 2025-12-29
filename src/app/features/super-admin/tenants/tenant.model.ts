export interface Tenant {
  id: number;
  companyName: string;
  email: string;
  phone: string;
  address?: string;
  isActive: boolean;
  subscriptionId?: number;
  subscription?: TenantSubscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSubscription {
  id: number;
  planId: number;
  planName: string;
  startDate: Date;
  endDate: Date;
  status: string;
}

export interface CreateTenantRequest {
  companyName: string;
  email: string;
  phone: string;
  address?: string;
  // Admin user details
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface UpdateTenantRequest {
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface AssignSubscriptionRequest {
  planId: number;
  startDate: Date;
  endDate: Date;
}
