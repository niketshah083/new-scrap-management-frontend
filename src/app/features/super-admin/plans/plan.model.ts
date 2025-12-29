export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  isActive: boolean;
  modules: PlanModule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanModule {
  id: number;
  name: string;
  code: string;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  moduleIds?: number[];
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  isActive?: boolean;
  moduleIds?: number[];
}

export interface AssignModulesRequest {
  moduleIds: number[];
}
