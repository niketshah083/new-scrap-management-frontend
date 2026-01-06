import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface WeightUpdate {
  weighbridgeId: number;
  weighbridgeName: string;
  weight: number;
  unit: string;
  isStable: boolean;
  timestamp: Date;
}

export interface CameraSnapshotUpdate {
  cameraId: number;
  cameraName: string;
  imageData: string;
  timestamp: Date;
}

export interface DeviceStatusUpdate {
  deviceId: number;
  deviceType: 'weighbridge' | 'camera';
  isOnline: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DeviceBridgeService implements OnDestroy {
  private socket: Socket | null = null;
  private readonly connectionStatus = new BehaviorSubject<boolean>(false);
  private readonly weightUpdates = new Subject<WeightUpdate>();
  private readonly cameraSnapshots = new Subject<CameraSnapshotUpdate>();
  private readonly cameraLiveFrames = new Subject<CameraSnapshotUpdate>();
  private readonly deviceStatus = new Subject<DeviceStatusUpdate>();

  readonly connectionStatus$ = this.connectionStatus.asObservable();
  readonly weightUpdates$ = this.weightUpdates.asObservable();
  readonly cameraSnapshots$ = this.cameraSnapshots.asObservable();
  readonly cameraLiveFrames$ = this.cameraLiveFrames.asObservable();
  readonly deviceStatus$ = this.deviceStatus.asObservable();

  constructor(private authService: AuthService) {}

  ngOnDestroy(): void {
    this.disconnect();
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.error('No auth token available for socket connection');
      return;
    }

    const socketUrl = environment.apiUrl.replace('/api', '');

    // Connect to the device-bridge namespace
    this.socket = io(`${socketUrl}/device-bridge`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus.next(false);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connectionStatus.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connectionStatus.next(false);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      this.connectionStatus.next(false);
    });

    // Weight updates from devices
    this.socket.on('weight:update', (data: WeightUpdate) => {
      this.weightUpdates.next({
        ...data,
        timestamp: new Date(data.timestamp),
      });
    });

    // Camera snapshot received
    this.socket.on('camera:snapshot-received', (data: CameraSnapshotUpdate) => {
      this.cameraSnapshots.next({
        ...data,
        timestamp: new Date(data.timestamp),
      });
    });

    // Camera live frame
    this.socket.on('camera:live-frame', (data: CameraSnapshotUpdate) => {
      this.cameraLiveFrames.next({
        ...data,
        timestamp: new Date(data.timestamp),
      });
    });

    // Device status changes
    this.socket.on('device:status-changed', (data: DeviceStatusUpdate) => {
      this.deviceStatus.next(data);
    });

    // Config updates
    this.socket.on('config:weighbridge-updated', (data: any) => {
      console.log('Weighbridge config updated:', data);
    });

    this.socket.on('config:camera-updated', (data: any) => {
      console.log('Camera config updated:', data);
    });
  }

  // Request weight reading from a specific weighbridge
  requestWeightReading(weighbridgeId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('command:read-weight', { weighbridgeId });
    }
  }

  // Request snapshot from a specific camera
  requestCameraSnapshot(cameraId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('command:capture-snapshot', { cameraId });
    }
  }

  // Subscribe to live camera stream
  subscribeToCameraLiveStream(cameraMasterId: number): Observable<CameraSnapshotUpdate> {
    if (this.socket?.connected) {
      this.socket.emit('camera:subscribe-live', { cameraMasterId });
    }
    return this.cameraLiveFrames$;
  }

  // Unsubscribe from live camera stream
  unsubscribeFromCameraLiveStream(cameraMasterId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('camera:unsubscribe-live', { cameraMasterId });
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
