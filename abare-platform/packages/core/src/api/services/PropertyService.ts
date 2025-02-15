import { BaseService } from './index';
import { ApiResponse, PaginatedResponse } from '../models';
import { PropertyType, PropertyMetadata } from '../../types/property';

export interface Property {
  id: string;
  name: string;
  address: string;
  property_type: PropertyType;
  square_footage: number;
  year_built?: number;
  purchase_price?: number;
  current_value?: number;
  occupancy_rate?: number;
  status: string;
  metadata: PropertyMetadata;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyInput {
  name: string;
  address: string;
  property_type: PropertyType;
  square_footage: number;
  year_built?: number;
  purchase_price?: number;
  current_value?: number;
  occupancy_rate?: number;
  metadata?: PropertyMetadata;
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  status?: string;
}

export class PropertyService extends BaseService {
  private basePath = '/api/v1/properties';

  async createProperty(input: CreatePropertyInput): Promise<ApiResponse<Property>> {
    return this.post<Property>(this.basePath, input);
  }

  async getProperty(id: string): Promise<ApiResponse<Property>> {
    return this.get<Property>(`${this.basePath}/${id}`);
  }

  async listProperties(
    page: number = 1,
    pageSize: number = 10,
    propertyType?: PropertyType,
    status?: string
  ): Promise<PaginatedResponse<Property>> {
    const params: Record<string, any> = { page, pageSize };
    if (propertyType) params.property_type = propertyType;
    if (status) params.status = status;

    return this.getPaginated<Property>(this.basePath, page, pageSize);
  }

  async updateProperty(id: string, input: UpdatePropertyInput): Promise<ApiResponse<Property>> {
    return this.put<Property>(`${this.basePath}/${id}`, input);
  }

  async deleteProperty(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.basePath}/${id}`);
  }
}
