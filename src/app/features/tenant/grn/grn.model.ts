export type GRNStatus = 'in_progress' | 'pending_approval' | 'approved' | 'rejected' | 'completed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface GRN {
  id: number;
  grnNumber: string;
  purchaseOrderId?: number;
  purchaseOrder?: { id: number; poNumber: string };
  vendorId: number;
  vendor?: { id: number; companyName: string; contactPerson: string };
  truckNumber: string;
  /** @deprecated Use fieldValues with fieldName="driver_name" instead */
  driverName?: string;
  /** @deprecated Use fieldValues with fieldName="driver_mobile" instead */
  driverMobile?: string;
  /** @deprecated Use fieldValues with fieldName="driver_licence" instead */
  driverLicence?: string;
  currentStep: number;
  status: GRNStatus;
  approvalStatus: ApprovalStatus;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  grossWeighbridgePhoto?: string;
  tareWeighbridgePhoto?: string;
  driverPhoto?: string;
  unloadingPhotos?: string[];
  unloadingRemarks?: string;
  reviewedBy?: number;
  reviewedAt?: Date;
  rejectionReason?: string;
  reviewRemarks?: string;
  fieldValues?: GRNFieldValue[];
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GRNFieldValue {
  id: number;
  fieldConfigId: number;
  fieldConfig?: GRNFieldConfig;
  value: string;
  textValue?: string;
  numberValue?: number;
  dateValue?: string;
  fileUrl?: string;
  fileUrls?: { key: string; url: string }[]; // NEW: Array of file URLs for preview
}

export interface GRNFieldConfig {
  id: number;
  stepNumber: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'date' | 'file' | 'photo' | 'dropdown';
  isRequired: boolean;
  options?: string[];
  allowMultiple: boolean;
  maxFiles: number;
  displayOrder: number;
  isActive: boolean;
  tenantId: number;
}

export interface CreateGRNRequest {
  purchaseOrderId?: number;
  vendorId: number;
  truckNumber: string;
  fieldValues?: { fieldConfigId: number; value: string }[];
}

export interface UpdateGRNStep2Request {
  grossWeight: number;
  grossWeightImage?: string;
  fieldValues?: { fieldConfigId: number; value: string }[];
}

export interface UpdateGRNStep3Request {
  driverPhoto?: string;
  driverLicenceImage?: string;
  unloadingPhotos: string[];
  unloadingNotes?: string;
  fieldValues?: { fieldConfigId: number; value: string }[];
}

export interface UpdateGRNStep4Request {
  tareWeight: number;
  tareWeightImage?: string;
  materialCount?: number;
  fieldValues?: { fieldConfigId: number; value: string }[];
}

export interface UpdateGRNStep5Request {
  verificationStatus: 'verified' | 'not_verified';
  approvalStatus: 'approved' | 'rejected';
  reviewNotes?: string;
  rejectionReason?: string;
  fieldValues?: { fieldConfigId: number; value: string }[];
}
