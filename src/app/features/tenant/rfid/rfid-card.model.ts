import { GRN } from '../grn/grn.model';
import { DoProcessing } from '../delivery-orders/do-processing/do-processing.model';

export enum RFIDCardStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  DAMAGED = 'damaged',
  LOST = 'lost',
}

export enum RFIDCardAssignmentType {
  GRN = 'grn',
  DO_PROCESSING = 'do_processing',
}

export interface RFIDCard {
  id: number;
  tenantId: number;
  cardNumber: string;
  grnId: number | null;
  doProcessingId: number | null;
  assignmentType: RFIDCardAssignmentType | null;
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
  grnId?: number;
  doProcessingId?: number;
}

export interface ScanRFIDCardRequest {
  cardNumber: string;
}

export interface ScanRFIDCardResponse {
  card: RFIDCard;
  grn: GRN | null;
  doProcessing: DoProcessing | null;
}

export interface AssignRFIDCardResponse {
  card: RFIDCard;
  grn?: GRN;
  doProcessing?: DoProcessing;
}
