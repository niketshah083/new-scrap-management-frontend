export enum CameraType {
  IP = 'IP',
  USB = 'USB',
  RTSP = 'RTSP',
}

export enum CameraTransport {
  TCP = 'tcp',
  UDP = 'udp',
}

export interface CameraMaster {
  id: number;
  tenantId: number;
  name: string;
  code: string;
  location?: string;
  description?: string;
  cameraType: CameraType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCameraMasterRequest {
  name: string;
  code: string;
  location?: string;
  description?: string;
  cameraType?: CameraType;
  isActive?: boolean;
}

export interface UpdateCameraMasterRequest {
  name?: string;
  code?: string;
  location?: string;
  description?: string;
  cameraType?: CameraType;
  isActive?: boolean;
}

export interface CameraConfig {
  id: number;
  cameraMasterId: number;
  tenantId: number;
  rtspUrl?: string;
  streamUrl?: string;
  username?: string;
  password?: string;
  snapshotWidth: number;
  snapshotHeight: number;
  snapshotQuality: number;
  transport: CameraTransport;
  timeout: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  cameraMaster?: CameraMaster;
}

export interface CreateCameraConfigRequest {
  cameraMasterId: number;
  rtspUrl?: string;
  streamUrl?: string;
  username?: string;
  password?: string;
  snapshotWidth?: number;
  snapshotHeight?: number;
  snapshotQuality?: number;
  transport?: CameraTransport;
  timeout?: number;
  isActive?: boolean;
}

export interface UpdateCameraConfigRequest {
  rtspUrl?: string;
  streamUrl?: string;
  username?: string;
  password?: string;
  snapshotWidth?: number;
  snapshotHeight?: number;
  snapshotQuality?: number;
  transport?: CameraTransport;
  timeout?: number;
  isActive?: boolean;
}

// Camera type options
export const CAMERA_TYPE_OPTIONS = [
  { label: 'IP Camera', value: CameraType.IP },
  { label: 'USB Camera', value: CameraType.USB },
  { label: 'RTSP Stream', value: CameraType.RTSP },
];

export const TRANSPORT_OPTIONS = [
  { label: 'TCP', value: CameraTransport.TCP },
  { label: 'UDP', value: CameraTransport.UDP },
];
