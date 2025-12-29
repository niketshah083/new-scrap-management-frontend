export interface User {
  id: number;
  name: string;
  email: string;
  tenantId?: number | null;
  roleId?: number | null;
  isSuperAdmin: boolean;
  permissions?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
