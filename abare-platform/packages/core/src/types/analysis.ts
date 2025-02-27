/**
 * Base analysis interface for all analysis types
 */
export interface BaseAnalysis {
  id: string;
  propertyId: string;
  type: 'financial' | 'market' | 'risk';
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'completed' | 'error';
  version: number;
}