import { GRN } from '../grn/grn.model';

export enum RFIDCardStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  DAMAGED = 'damaged',
  LOST = 'lost',
}

export interface RFIDCard {
  id: number;
  tenantId: number;
  cardNumber: string;
  grnId: number | null;
  status: RFIDCardStatus;
  assignedAt: Date | null;
  lastScannedAt: Date | null;
  lastScannedBy: number | null;
  notes: string | null;
  label: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRFIDCardRequest {
  cardNumber: string;
  label?: string;
  notes?: string;
}

export interface UpdateRFIDCardRequest {
  label?: string;
  status?: RFIDCardStatus;
  notes?: string;
}

export interface AssignRFIDCardRequest {
  cardNumber: string;
  grnId: number;
}

export interface ScanRFIDCardRequest {
  cardNumber: string;
}

export interface ScanRFIDCardResponse {
  card: RFIDCard;
  grn: GRN | null;
}

export interface AssignRFIDCardResponse {
  card: RFIDCard;
  grn: GRN;
}
