export interface Transporter {
  id: number | string;
  tenantId?: number;
  transporterName: string;
  gstin: string | null;
  mobileNo: string | null;
  gstState: string | null;
  isActive: boolean;
  isExternal?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransporterRequest {
  transporterName: string;
  gstin?: string;
  mobileNo?: string;
  gstState?: string;
  isActive?: boolean;
}

export interface UpdateTransporterRequest extends Partial<CreateTransporterRequest> {}
