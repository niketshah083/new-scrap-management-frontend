export enum DoProcessingStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum DoProcessingStep {
  GateEntry = 'gate_entry', // Step 1: Truck arrives, RFID issued
  InitialWeighing = 'initial_weighing', // Step 2: Weighbridge-1 tare weight
  ItemLoading = 'item_loading', // Step 3-7: Loading items at weighbridge-2
  FinalWeighing = 'final_weighing', // Step 8: Final weighbridge-1 gross weight
  Completed = 'completed', // Step 9: Process complete
}

export enum DoItemLoadingStatus {
  Pending = 'pending', // Item not yet loaded
  AtWeighbridge = 'at_weighbridge', // Item at weighbridge-2, ready for loading
  Loading = 'loading', // Item being loaded
  Loaded = 'loaded', // Item loaded and weighed
  Skipped = 'skipped', // Item skipped
}

export interface DoProcessingItem {
  id: number;
  doProcessingId: number;
  externalItemId?: string;
  materialId?: string;
  materialName?: string;
  materialCode?: string;
  orderedQuantity?: number;
  orderedRate?: number;

  // Weighbridge-2 measurements
  tareWeightWb2?: number;
  tareTimeWb2?: Date;
  grossWeightWb2?: number;
  grossTimeWb2?: Date;
  loadedWeight?: number;
  weighbridgeId?: number;

  // Status and timing
  loadingStatus: DoItemLoadingStatus;
  loadingSequence?: number;
  loadingStartTime?: Date;
  loadingCompleteTime?: Date;
  itemRemarks?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface DoProcessing {
  id: number;
  tenantId: number;
  externalDoId?: string;
  doNumber: string;
  doDate?: Date;
  vendorId?: string;
  vendorName?: string;

  // Transporter info
  transporterId?: number | string;
  transporterName?: string;
  transporterGstin?: string;

  // Vehicle and driver info
  vehicleNo?: string;
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;

  // RFID tracking
  rfidTag?: string;
  rfidIssuedTime?: Date;
  rfidCardId?: number;

  // Step 1: Gate Entry
  gateEntryTime?: Date;

  // Step 2: Initial Weighing (Weighbridge-1)
  initialTareWeight?: number;
  initialWeighingTime?: Date;
  initialWeighbridgeId?: number;
  driverPhotoPath?: string;
  licensePhotoPath?: string;
  truckPhotoPath?: string;

  // Step 8: Final Weighing (Weighbridge-1)
  finalGrossWeight?: number;
  finalWeighingTime?: Date;
  finalWeighbridgeId?: number;

  // Calculated weights
  totalLoadedWeight?: number;
  netWeight?: number;

  // Status tracking
  status: DoProcessingStatus;
  currentStep: DoProcessingStep;
  completedTime?: Date;
  remarks?: string;

  // Items
  items: DoProcessingItem[];

  createdAt: Date;
  updatedAt: Date;
}

export interface DoProcessingStats {
  total: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

// Request DTOs
export interface StartDoProcessingRequest {
  externalDoId?: string;
  doNumber: string;
  doDate?: string;
  vendorId?: string;
  vendorName?: string;
  vehicleNo?: string;
  driverName?: string;
  driverPhone?: string;
  remarks?: string;
  items: {
    externalItemId?: string;
    materialId?: string;
    materialName?: string;
    materialCode?: string;
    orderedQuantity?: number;
    orderedRate?: number;
  }[];
}

export interface GateEntryRequest {
  vehicleNo: string;
  driverName: string;
  driverPhone?: string;
  driverLicense?: string;
  rfidCardNumber?: string;
  transporterId?: number | string;
  remarks?: string;
}

export interface InitialWeighingRequest {
  initialTareWeight: number;
  weighbridgeId?: number;
  driverPhotoPath?: string;
  licensePhotoPath?: string;
  truckPhotoPath?: string;
}

export interface ItemTareWeightRequest {
  itemId: number;
  tareWeightWb2: number;
  weighbridgeId?: number;
}

export interface ItemGrossWeightRequest {
  itemId: number;
  grossWeightWb2: number;
  weighbridgeId?: number;
  itemRemarks?: string;
}

export interface ItemWeightRequest {
  itemId: number;
  tareWeightWb2: number;
  grossWeightWb2: number;
  weighbridgeId?: number;
  itemRemarks?: string;
}

export interface FinalWeighingRequest {
  finalGrossWeight: number;
  weighbridgeId?: number;
  remarks?: string;
}
