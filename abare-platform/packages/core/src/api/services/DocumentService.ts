import { BaseService } from './index';
import { ApiResponse, PaginatedResponse } from '../models';

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
