export interface Vendor {
  id: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVendorRequest {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface UpdateVendorRequest {
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}
