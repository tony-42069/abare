export * from './api/models';
export * from './api/services';

export { ApiClient } from './api/core/ApiClient';
export { ApiError } from './api/core/ApiError';
export { CancelablePromise } from './api/core/CancelablePromise';
export { OpenAPI } from './api/core/OpenAPI';
export { RequestOptions } from './api/core/RequestOptions';

// Re-export common types
export type {
  Property,
  Tenant,
  Document,
  Analysis,
} from './api/models';

// Re-export service types
export type {
  PropertyService,
  DocumentService,
  AnalysisService,
} from './api/services';

// Configure API client
import { OpenAPI } from './api/core/OpenAPI';

export const configureApi = (baseUrl: string, token?: string) => {
  OpenAPI.BASE = baseUrl;
  if (token) {
    OpenAPI.TOKEN = token;
  }
};
