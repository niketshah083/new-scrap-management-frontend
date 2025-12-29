export type POStatus = 'draft' | 'confirmed' | 'partial' | 'completed' | 'cancelled';

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  vendorId: number;
  vendor?: { id: number; companyName: string; contactPerson: string };
  expectedDeliveryDate: string;
  status: POStatus;
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id?: number;
  materialId: number;
  material?: { id: number; name: string; code: string; unitOfMeasure: string };
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface CreatePurchaseOrderItemRequest {
  materialId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderRequest {
  poNumber: string;
  vendorId: number;
  expectedDeliveryDate: string;
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface UpdatePurchaseOrderRequest {
  poNumber?: string;
  vendorId?: number;
  expectedDeliveryDate?: string;
  notes?: string;
  items?: CreatePurchaseOrderItemRequest[];
}
