// Re-export models and types
export type {
  ApiResponse,
  ErrorResponse,
  PaginatedResponse,
} from './api/models';

// Re-export property types
export {
  PropertyType,
  RiskLevel,
  RiskProfileType,
  type RiskProfile,
} from './types/property';

// Re-export credit risk types
export {
  CreditRiskLevel,
  IndustryType,
  type TenantRisk,
  type ConcentrationRisk,
  type Tenant,
  type CreditRiskAnalysis,
  type CreditRiskDashboardData,
  // Added exports for compatibility with analytics package
  type TenantProfile,
  type LeaseRisk,
  type TenantConcentration,
} from './types/credit-risk';

// Re-export service types
export type {
  Document,
  DocumentTaskStatus,
} from './api/services/DocumentService';

export type {
  Property,
  CreatePropertyInput,
  UpdatePropertyInput,
} from './api/services/PropertyService';

export type {
  Analysis,
  CreateAnalysisInput,
  UpdateAnalysisInput,
} from './api/services/AnalysisService';

// Re-export base analysis type
export type { BaseAnalysis } from './types/analysis';

// Re-export service implementations
export { DocumentService } from './api/services/DocumentService';
export { PropertyService } from './api/services/PropertyService';
export { AnalysisService } from './api/services/AnalysisService';

// Re-export core client types and implementation
export type { RequestOptions } from './api/client/RequestOptions';
export { ApiClient } from './api/client/ApiClient';

// Create and export default API client instance
import { ApiClient } from './api/client/ApiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const createApiClient = (baseUrl: string = API_BASE_URL, headers: Record<string, string> = {}) => {
  return new ApiClient(baseUrl, headers);
};

export default createApiClient;