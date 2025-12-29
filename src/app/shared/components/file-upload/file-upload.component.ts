import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewChild,
  ElementRef,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UploadedFile {
  name: string;
  key: string; // S3 key
  preview?: string;
  file?: File;
  uploading?: boolean;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    key: string;
    originalName: string;
    mimeType: string;
    size: number;
  };
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, Dialog, ProgressSpinner],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor, OnDestroy {
  private http = inject(HttpClient);

  @Input() label: string = '';
  @Input() placeholder: string = 'Select or capture file';
  @Input() accept: string = '*/*';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showCamera: boolean = true;
  @Input() showFileUpload: boolean = true;
  @Input() multiple: boolean = false;
  @Input() maxFiles: number = 10;
  @Input() maxFileSize: number = 10 * 1024 * 1024; // 10MB default
  @Input() folder: string = 'images'; // S3 folder

  @Output() fileSelected = new EventEmitter<File>();
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() fileRemoved = new EventEmitter<void>();
  @Output() uploadComplete = new EventEmitter<UploadedFile>();
  @Output() uploadError = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  // Single file mode
  value: string = '';
  fileName: string = '';
  filePreview: string | null = null;
  isUploading: boolean = false;

  // Multiple files mode
  files: UploadedFile[] = [];

  showCameraDialog: boolean = false;
  cameraStream: MediaStream | null = null;
  cameraError: string = '';
  isCapturing: boolean = false;

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  private apiUrl = environment.apiUrl;

  writeValue(value: any): void {
    if (this.multiple) {
      // For multiple mode, value is array of S3 keys (comma-separated string or array)
      if (Array.isArray(value)) {
        this.files = value.map((key) => ({ name: this.getFileNameFromKey(key), key }));
      } else if (typeof value === 'string' && value) {
        const keys = value
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k);
        this.files = keys.map((key) => ({ name: this.getFileNameFromKey(key), key }));
      } else {
        this.files = [];
      }
    } else {
      // Single file mode - value is S3 key
      this.value = value || '';
      this.fileName = value ? this.getFileNameFromKey(value) : '';
    }
  }

  private getFileNameFromKey(key: string): string {
    // Extract filename from S3 key like "tenant-4/images/1234567890-abc12345.jpg"
    const parts = key.split('/');
    return parts[parts.length - 1] || key;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (this.multiple) {
        const newFiles = Array.from(input.files);
        this.handleMultipleFiles(newFiles);
      } else {
        this.handleFile(input.files[0]);
      }
      input.value = '';
    }
  }

  private async handleFile(file: File): Promise<void> {
    if (file.size > this.maxFileSize) {
      alert(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
      return;
    }

    this.isUploading = true;
    this.fileName = file.name;

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.filePreview = null;
    }

    try {
      const result = await this.uploadToS3(file);
      this.value = result.key;
      this.onChange(this.value);
      this.fileSelected.emit(file);
      this.uploadComplete.emit({ name: file.name, key: result.key });
    } catch (error: any) {
      console.error('Upload error:', error);
      this.fileName = '';
      this.filePreview = null;
      this.uploadError.emit(error.message || 'Upload failed');
      alert('Failed to upload file. Please try again.');
    } finally {
      this.isUploading = false;
    }
  }

  private async handleMultipleFiles(newFiles: File[]): Promise<void> {
    const validFiles: File[] = [];

    for (const file of newFiles) {
      if (file.size > this.maxFileSize) {
        alert(`File "${file.name}" exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
        continue;
      }

      if (this.files.length + validFiles.length >= this.maxFiles) {
        alert(`Maximum ${this.maxFiles} files allowed`);
        break;
      }

      // Check for duplicate file names
      const isDuplicate = this.files.some((f) => f.name === file.name);
      if (isDuplicate) {
        continue;
      }

      validFiles.push(file);
    }

    // Upload each file
    for (const file of validFiles) {
      const uploadedFile: UploadedFile = {
        name: file.name,
        key: '',
        file: file,
        uploading: true,
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      this.files.push(uploadedFile);

      try {
        const result = await this.uploadToS3(file);
        uploadedFile.key = result.key;
        uploadedFile.uploading = false;
        this.updateFormValue();
        this.uploadComplete.emit(uploadedFile);
      } catch (error: any) {
        console.error('Upload error:', error);
        uploadedFile.uploading = false;
        uploadedFile.error = error.message || 'Upload failed';
        // Remove failed upload from list
        const index = this.files.indexOf(uploadedFile);
        if (index > -1) {
          this.files.splice(index, 1);
        }
        this.uploadError.emit(error.message || 'Upload failed');
      }
    }

    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
    }
  }

  private async uploadToS3(file: File): Promise<{ key: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', this.folder);

    const response = await firstValueFrom(
      this.http.post<UploadResponse>(`${this.apiUrl}/uploads/image`, formData)
    );

    if (!response.success) {
      throw new Error(response.message || 'Upload failed');
    }

    return {
      key: response.data.key,
      url: response.data.url,
    };
  }

  private updateFormValue(): void {
    // Get all successfully uploaded file keys
    const keys = this.files.filter((f) => f.key && !f.uploading && !f.error).map((f) => f.key);

    // Store as comma-separated string for backend compatibility
    this.onChange(keys.join(','));
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  openCamera(): void {
    this.showCameraDialog = true;
    this.cameraError = '';
    this.startCamera();
  }

  async startCamera(): Promise<void> {
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.cameraStream;
        }
      }, 100);
    } catch (error: any) {
      console.error('Camera error:', error);
      this.cameraError = 'Unable to access camera. Please check permissions.';
    }
  }

  capturePhoto(): void {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) return;

    this.isCapturing = true;
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const file = new File([blob], `capture-${timestamp}.jpg`, { type: 'image/jpeg' });

          if (this.multiple) {
            this.handleMultipleFiles([file]);
          } else {
            this.handleFile(file);
          }
          this.closeCamera();
        }
        this.isCapturing = false;
      },
      'image/jpeg',
      0.9
    );
  }

  closeCamera(): void {
    this.stopCamera();
    this.showCameraDialog = false;
  }

  private stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    }
  }

  removeFile(): void {
    this.value = '';
    this.fileName = '';
    this.filePreview = null;
    this.onChange('');
    this.fileRemoved.emit();

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removeFileAt(index: number): void {
    this.files.splice(index, 1);
    this.updateFormValue();
    this.fileRemoved.emit();
  }

  onBlur(): void {
    this.onTouched();
  }

  get hasFiles(): boolean {
    return this.multiple ? this.files.length > 0 : !!this.fileName;
  }

  get canAddMore(): boolean {
    return this.multiple && this.files.length < this.maxFiles;
  }

  get isAnyUploading(): boolean {
    return this.isUploading || this.files.some((f) => f.uploading);
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }
}
