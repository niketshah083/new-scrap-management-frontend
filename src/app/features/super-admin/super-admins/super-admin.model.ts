export interface SuperAdmin {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSuperAdminRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateSuperAdminRequest {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}
