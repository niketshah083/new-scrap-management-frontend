export interface WeighbridgeMaster {
  id: number;
  tenantId: number;
  name: string;
  code: string;
  location?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWeighbridgeMasterRequest {
  name: string;
  code: string;
  location?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateWeighbridgeMasterRequest {
  name?: string;
  code?: string;
  location?: string;
  description?: string;
  isActive?: boolean;
}

export interface WeighbridgeConfig {
  id: number;
  weighbridgeMasterId: number;
  tenantId: number;
  serialPort: string;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: string;
  weightRegex?: string;
  weightStartMarker?: string;
  weightEndMarker?: string;
  weightMultiplier: number;
  weightUnit: string;
  pollingInterval: number;
  stableReadings: number;
  stabilityThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  weighbridgeMaster?: WeighbridgeMaster;
}

export interface CreateWeighbridgeConfigRequest {
  weighbridgeMasterId: number;
  serialPort: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: string;
  weightRegex?: string;
  weightStartMarker?: string;
  weightEndMarker?: string;
  weightMultiplier?: number;
  weightUnit?: string;
  pollingInterval?: number;
  stableReadings?: number;
  stabilityThreshold?: number;
  isActive?: boolean;
}

export interface UpdateWeighbridgeConfigRequest {
  serialPort?: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: string;
  weightRegex?: string;
  weightStartMarker?: string;
  weightEndMarker?: string;
  weightMultiplier?: number;
  weightUnit?: string;
  pollingInterval?: number;
  stableReadings?: number;
  stabilityThreshold?: number;
  isActive?: boolean;
}

// Serial port configuration options
export const BAUD_RATES = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];
export const DATA_BITS = [5, 6, 7, 8];
export const STOP_BITS = [1, 2];
export const PARITY_OPTIONS = ['none', 'even', 'odd', 'mark', 'space'];
export const WEIGHT_UNITS = ['kg', 'g', 'lb', 'oz', 't'];
