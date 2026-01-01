// Matches backend grn.entity.ts status field
export type GRNStatus = 'in_progress' | 'completed' | 'rejected';

// Matches backend grn.entity.ts approvalStatus field (nullable in backend)
export type ApprovalStatus = 'approved' | 'rejected';

// Matches backend grn.entity.ts verificationStatus field
export type VerificationStatus = 'verified' | 'not_verified';

/**
 * GRN Entity
 *
 * STATIC FIELDS (in GRN entity):
 * - Step 1: truckNumber
 * - Step 4: netWeight (auto-calculated from gross_weight - tare_weight)
 * - Step 5: verificationStatus, approvalStatus, rejectionReason
 *
 * DYNAMIC FIELDS (stored in fieldValues):
 * - Step 2: gross_weight, gross_weight_image
 * - Step 3: driver_photo, driver_licence_image, unloading_photos, unloading_notes, material_count
 * - Step 4: tare_weight, tare_weight_image
 */
export interface GRN {
  id: number;
  grnNumber: string;
  purchaseOrderId?: number;
  purchaseOrder?: { id: number; poNumber: string };
  vendorId?: number;
  vendor?: { id: number; companyName: string; contactPerson: string };
  externalPoId?: string;
  externalVendorId?: string;
  usesExternalDb?: boolean;
  currentStep: number;
  status: GRNStatus;

  // Step 1 - Gate Entry (static field)
  truckNumber: string;

  // Step 4 - Final Weighing (static field, auto-calculated)
  netWeight?: number;

  // Step 5 - Supervisor Review (static fields)
  verificationStatus?: VerificationStatus;
  approvalStatus?: ApprovalStatus;
  rejectionReason?: string;
  reviewedBy?: number;
  reviewedAt?: Date;

  // Dynamic field values (Step 2, 3, 4 fields are stored here)
  fieldValues?: GRNFieldValue[];

  // Metadata
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
  fileUrls?: { key: string; url: string }[]; // Array of file URLs for preview
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
  vendorId?: number;
  externalVendorId?: string;
  externalPoId?: string;
  truckNumber: string;
  fieldValues?: { fieldConfigId: number; value: string }[];
}

/**
 * Step 2 - Initial Weighing
 * Dynamic fields: gross_weight (required), gross_weight_image (optional, max 3 files)
 */
export interface UpdateGRNStep2Request {
  fieldValues: { fieldConfigId?: number; fieldName?: string; value: string }[];
}

/**
 * Step 3 - Unloading
 * Dynamic fields: driver_photo, driver_licence_image (max 2), unloading_photos (max 3), unloading_notes, material_count
 */
export interface UpdateGRNStep3Request {
  fieldValues: { fieldConfigId?: number; fieldName?: string; value: string }[];
}

/**
 * Step 4 - Final Weighing
 * Dynamic fields: tare_weight, tare_weight_image (max 3), net_weight (auto-calculated)
 */
export interface UpdateGRNStep4Request {
  fieldValues: { fieldConfigId?: number; fieldName?: string; value: string }[];
}

/**
 * Step 5 - Supervisor Review
 * Static fields: verificationStatus, approvalStatus, rejectionReason
 */
export interface UpdateGRNStep5Request {
  verificationStatus: VerificationStatus;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  fieldValues?: { fieldConfigId?: number; fieldName?: string; value: string }[];
}

// Helper function to get field value from GRN
export function getFieldValue(grn: GRN, fieldName: string): string | null {
  if (!grn.fieldValues) return null;
  const fv = grn.fieldValues.find((v) => v.fieldConfig?.fieldName === fieldName);
  return fv?.textValue || fv?.numberValue?.toString() || fv?.fileUrl || null;
}

// Helper function to get numeric field value from GRN
export function getNumericFieldValue(grn: GRN, fieldName: string): number | null {
  if (!grn.fieldValues) return null;
  const fv = grn.fieldValues.find((v) => v.fieldConfig?.fieldName === fieldName);
  return fv?.numberValue || null;
}
