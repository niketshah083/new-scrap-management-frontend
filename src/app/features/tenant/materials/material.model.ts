export interface Material {
  id: number;
  name: string;
  code: string;
  unitOfMeasure: string;
  category: string;
  isActive: boolean;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMaterialRequest {
  name: string;
  code: string;
  unitOfMeasure: string;
  category: string;
}

export interface UpdateMaterialRequest {
  name?: string;
  code?: string;
  unitOfMeasure?: string;
  category?: string;
  isActive?: boolean;
}
