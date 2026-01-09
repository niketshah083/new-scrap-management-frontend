export interface DeliveryOrder {
  id: number;
  doNumber: string;
  vendorId: number;
  vendor?: { id: number; companyName: string; contactPerson: string };
  vendorName?: string; // From data source (external DB)
  doDate: string;
  vehicleNo?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  totalAmount: number;
  remarks?: string;
  items: DeliveryOrderItem[];
  tenantId?: number;
  isExternal?: boolean; // Flag to indicate if from external DB
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeliveryOrderItem {
  id?: number;
  materialId: number;
  material?: { id: number; name: string; code: string; unitOfMeasure: string };
  materialName?: string; // From data source (external DB)
  wbNetWeight?: number;
  quantity: number;
  rate: number;
  amount?: number;
}

export interface CreateDeliveryOrderItemRequest {
  materialId: number;
  wbNetWeight?: number;
  quantity: number;
  rate: number;
}

export interface CreateDeliveryOrderRequest {
  doNumber: string;
  vendorId: number;
  doDate: string;
  vehicleNo?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  remarks?: string;
  items: CreateDeliveryOrderItemRequest[];
}

export interface UpdateDeliveryOrderRequest {
  doNumber?: string;
  vendorId?: number;
  doDate?: string;
  vehicleNo?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  remarks?: string;
  items?: CreateDeliveryOrderItemRequest[];
}
