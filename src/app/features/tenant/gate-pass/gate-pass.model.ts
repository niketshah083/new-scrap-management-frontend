export interface GatePass {
  id: number;
  passNumber: string;
  grnId: number;
  grn?: {
    id: number;
    grnNumber: string;
  };
  status: GatePassStatus;
  expiresAt: string;
  usedAt?: string;
  usedBy?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type GatePassStatus = 'active' | 'used' | 'expired';

export interface CreateGatePassRequest {
  grnId: number;
  expiryMinutes?: number;
  notes?: string;
}

export interface VerifyGatePassRequest {
  passNumber: string;
}

export interface MarkGatePassUsedRequest {
  notes?: string;
}

export interface GatePassVerifyResult {
  valid: boolean;
  message: string;
  gatePass?: GatePass;
}
