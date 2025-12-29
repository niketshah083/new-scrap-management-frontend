export interface TenantRole {
  id: number;
  name: string;
  description?: string;
  permissions: RolePermission[];
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  id: number;
  code: string;
  moduleId: number;
  operationId: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: number[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface AssignPermissionsRequest {
  permissionIds: number[];
}
