export interface QCInspection {
  id: number;
  inspectionNumber?: string;
  grnId: number;
  grn?: {
    id: number;
    grnNumber: string;
    vendor?: {
      id: number;
      companyName: string;
    };
  };
  materialId?: number;
  material?: {
    id: number;
    name: string;
    code: string;
  };
  status: QCStatus;
  testParameters?: TestParameter[];
  moistureContent?: number;
  impurityPercentage?: number;
  qualityGrade?: number;
  remarks?: string;
  samplePhotos?: string[];
  failureReason?: string;
  inspectedBy?: number;
  inspectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type QCStatus = 'pending' | 'in_progress' | 'pass' | 'fail';

export interface TestParameter {
  name: string;
  expectedValue: string;
  actualValue: string;
  unit?: string;
  passed: boolean;
}

export interface CreateQCInspectionRequest {
  grnId: number;
  materialId?: number;
}

export interface UpdateQCInspectionRequest {
  testParameters?: TestParameter[];
  moistureContent?: number;
  impurityPercentage?: number;
  qualityGrade?: number;
  remarks?: string;
  samplePhotos?: string[];
}

export interface CompleteQCInspectionRequest extends UpdateQCInspectionRequest {
  result: 'pass' | 'fail';
  failureReason?: string;
}

export interface QCStats {
  total: number;
  pending: number;
  inProgress: number;
  passed: number;
  failed: number;
}
