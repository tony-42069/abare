import { RequestOptions } from './RequestOptions';
import { ApiResponse, ErrorResponse } from '../models';

export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers
    };
  }

  async get<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T>(path: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, data, options);
  }

  async put<T>(path: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, data, options);
  }

  async delete<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private async request<T>(
    method: string,
    path: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(path.startsWith('/') ? path.slice(1) : path, this.baseUrl);
    
    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = options.timeout
        ? setTimeout(() => controller.abort(), options.timeout)
        : null;

      const response = await fetch(url.toString(), {
        method,
        headers: {
          ...this.headers,
          ...options.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: options.signal || controller.signal,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw {
          error: responseData.error || 'Unknown error',
          status: response.status,
          details: responseData.details,
        } as ErrorResponse;
      }

      return {
        data: responseData as T,
        status: response.status,
        message: responseData.message,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          error: 'Request timeout',
          status: 408,
          details: { message: 'Request timed out' },
        } as ErrorResponse;
      }
      throw error;
    }
  }

  setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  removeHeader(key: string): void {
    delete this.headers[key];
  }

  getHeaders(): Record<string, string> {
    return { ...this.headers };
  }
}
