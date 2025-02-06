import { BaseService } from './index';
import { ApiResponse, PaginatedResponse } from '../models';

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
    const params: Record<string, any> = { page, pageSize };
    if (propertyId) params.property_id = propertyId;
    if (analysisType) params.analysis_type = analysisType;
    if (status) params.status = status;

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
