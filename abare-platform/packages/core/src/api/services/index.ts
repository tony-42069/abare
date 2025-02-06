import { ApiClient } from '../client/ApiClient';
import { ApiResponse, PaginatedResponse } from '../models';
import { RequestOptions } from '../client/RequestOptions';

// Base Service Class
export abstract class BaseService {
  protected client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  protected async get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.client.get<T>(path, options);
  }

  protected async post<T>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.client.post<T>(path, data, options);
  }

  protected async put<T>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.client.put<T>(path, data, options);
  }

  protected async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.client.delete<T>(path, options);
  }

  protected async getPaginated<T>(
    path: string,
    page: number = 1,
    pageSize: number = 10,
    options: RequestOptions = {}
  ): Promise<PaginatedResponse<T>> {
    const params = {
      ...options.params,
      page,
      pageSize,
    };

    const response = await this.client.get<PaginatedResponse<T>>(path, {
      ...options,
      params,
    });

    return response.data;
  }
}

// Document Service Types and Implementation
export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  document_type?: string;
  property_id?: string;
  processing_status: Record<string, string>;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentTaskStatus {
  status: string;
  processing_status: Record<string, string>;
  has_task: boolean;
  task?: {
    id: string;
    status: string;
    created_at: string;
    updated_at: string;
    error?: string;
  };
}

export class DocumentService extends BaseService {
  private basePath = '/api/v1/documents';

  async uploadDocument(file: File, propertyId?: string, documentType?: string): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    if (propertyId) formData.append('property_id', propertyId);
    if (documentType) formData.append('document_type', documentType);

    return this.post<Document>(`${this.basePath}/upload`, {
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getDocument(id: string): Promise<ApiResponse<Document>> {
    return this.get<Document>(`${this.basePath}/${id}`);
  }

  async getDocumentTaskStatus(id: string): Promise<ApiResponse<DocumentTaskStatus>> {
    return this.get<DocumentTaskStatus>(`${this.basePath}/${id}/task`);
  }

  async listDocuments(
    page: number = 1,
    pageSize: number = 10,
    propertyId?: string,
    documentType?: string,
    status?: string
  ): Promise<PaginatedResponse<Document>> {
    return this.getPaginated<Document>(this.basePath, page, pageSize);
  }

  async reprocessDocument(id: string): Promise<ApiResponse<void>> {
    return this.post<void>(`${this.basePath}/${id}/reprocess`);
  }

  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.basePath}/${id}`);
  }
}

// Property Service Types and Implementation
export interface Property {
  id: string;
  name: string;
  address: string;
  property_type: string;
  square_footage: number;
  year_built?: number;
  purchase_price?: number;
  current_value?: number;
  occupancy_rate?: number;
  status: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyInput {
  name: string;
  address: string;
  property_type: string;
  square_footage: number;
  year_built?: number;
  purchase_price?: number;
  current_value?: number;
  occupancy_rate?: number;
  metadata?: Record<string, any>;
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
    propertyType?: string,
    status?: string
  ): Promise<PaginatedResponse<Property>> {
    return this.getPaginated<Property>(this.basePath, page, pageSize);
  }

  async updateProperty(id: string, input: UpdatePropertyInput): Promise<ApiResponse<Property>> {
    return this.put<Property>(`${this.basePath}/${id}`, input);
  }

  async deleteProperty(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.basePath}/${id}`);
  }
}

// Analysis Service Types and Implementation
export interface Analysis {
  id: string;
  property_id: string;
  analysis_type: string;
  status: string;
  results: {
    metrics: Record<string, number>;
    insights: Record<string, any>;
    recommendations: string[];
    risk_factors: Array<{
      category: string;
      level: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateAnalysisInput {
  property_id: string;
  analysis_type: string;
  parameters?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateAnalysisInput {
  status?: string;
  results?: Partial<Analysis['results']>;
  metadata?: Record<string, any>;
}

export class AnalysisService extends BaseService {
  private basePath = '/api/v1/analysis';

  async createAnalysis(input: CreateAnalysisInput): Promise<ApiResponse<Analysis>> {
    return this.post<Analysis>(this.basePath, input);
  }

  async getAnalysis(id: string): Promise<ApiResponse<Analysis>> {
    return this.get<Analysis>(`${this.basePath}/${id}`);
  }

  async listAnalyses(
    page: number = 1,
    pageSize: number = 10,
    propertyId?: string,
    analysisType?: string,
    status?: string
  ): Promise<PaginatedResponse<Analysis>> {
    return this.getPaginated<Analysis>(this.basePath, page, pageSize);
  }

  async updateAnalysis(id: string, input: UpdateAnalysisInput): Promise<ApiResponse<Analysis>> {
    return this.put<Analysis>(`${this.basePath}/${id}`, input);
  }

  async deleteAnalysis(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.basePath}/${id}`);
  }

  async getPropertyAnalyses(propertyId: string): Promise<ApiResponse<Analysis[]>> {
    return this.get<Analysis[]>(`${this.basePath}/property/${propertyId}`);
  }

  async runAnalysis(id: string): Promise<ApiResponse<void>> {
    return this.post<void>(`${this.basePath}/${id}/run`);
  }

  async cancelAnalysis(id: string): Promise<ApiResponse<void>> {
    return this.post<void>(`${this.basePath}/${id}/cancel`);
  }
}
