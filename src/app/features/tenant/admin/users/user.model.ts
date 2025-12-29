export interface TenantUser {
  id: number;
  name: string;
  email: string;
  roleId?: number;
  role?: { id: number; name: string };
  isActive: boolean;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateUserRoleRequest {
  roleId: number;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
