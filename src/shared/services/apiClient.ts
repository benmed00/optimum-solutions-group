/**
 * Centralized API client with retry, timeout, and error normalization.
 * Use for all HTTP requests to ensure consistent behavior.
 *
 * @example
 * ```ts
 * import { apiClient } from '@/shared/services/apiClient';
 * const data = await apiClient.get('/user/profile', { baseUrl: API_URL });
 * await apiClient.post('/contact', { name, email, message });
 * ```
 * @module apiClient
 */

/** Configuration for API requests (retry, timeout, headers). */
export interface ApiClientConfig {
  /** Base URL prepended to relative paths (e.g. `https://api.example.com/v1`). */
  baseUrl?: string;
  /** Request timeout in ms. Default: 10000. */
  timeout?: number;
  /** Number of retries for retryable errors (5xx, 408, 429). Default: 2. */
  retries?: number;
  /** Delay between retries in ms. Default: 1000. */
  retryDelay?: number;
  /** Additional headers merged with request. */
  headers?: Record<string, string>;
}

/** HTTP error with status code and raw Response for inspection. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000;

function isRetryable(status: number): boolean {
  return status >= 500 || status === 408 || status === 429;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Options for apiRequest; extends RequestInit with typed body. */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /** Request body; will be JSON.stringify'd if object. */
  body?: unknown;
  /** Override fetch options (e.g. keepalive for page unload). */
  fetchOverrides?: RequestInit;
}

/**
 * Low-level HTTP request with retry, timeout, and JSON handling.
 * Prefer apiClient.get/post/put/delete for typical usage.
 *
 * @param url - Full URL or path (relative to config.baseUrl)
 * @param options - Method, headers, body
 * @param config - baseUrl, timeout, retries, retryDelay, headers
 * @returns Parsed JSON or text; undefined for 204/empty
 * @throws {ApiError} On non-2xx after retries
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
  config: ApiClientConfig = {}
): Promise<T> {
  const {
    baseUrl = '',
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    headers: configHeaders = {},
  } = config;

  const fullUrl = url.startsWith('http') ? url : `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...configHeaders,
    ...(options.headers as Record<string, string>),
  };

  const body = options.body !== undefined
    ? typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
    : undefined;

  const { body: _body, fetchOverrides, ...restOptions } = options;
  const fetchOptions: RequestInit = {
    ...restOptions,
    ...fetchOverrides,
    headers,
    ...(body !== undefined && { body }),
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(fullUrl, fetchOptions, timeout);

      if (!response.ok) {
        const text = await response.text();
        const error = new ApiError(
          `API error: ${response.status} ${response.statusText}${text ? ` - ${text.slice(0, 200)}` : ''}`,
          response.status,
          response
        );

        if (isRetryable(response.status) && attempt < retries) {
          lastError = error;
          await new Promise((r) => setTimeout(r, retryDelay * (attempt + 1)));
          continue;
        }

        throw error;
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const text = await response.text();
        return (text ? JSON.parse(text) : undefined) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (error instanceof ApiError) {
        throw error;
      }

      const isNetworkError =
        error instanceof TypeError &&
        (error.message.includes('fetch') || error.message.includes('network'));

      if ((isNetworkError || error instanceof Error && error.name === 'AbortError') && attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelay * (attempt + 1)));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new ApiError('Request failed after retries');
}

/** Typed HTTP client: get, post, put, delete with retry and timeout. */
export const apiClient = {
  /** GET request. */
  get: <T = unknown>(url: string, config?: ApiClientConfig) =>
    apiRequest<T>(url, { method: 'GET' }, config),

  /** POST request with optional JSON body. */
  post: <T = unknown>(url: string, body?: unknown, config?: ApiClientConfig) =>
    apiRequest<T>(url, { method: 'POST', body }, config),

  /** PUT request with optional JSON body. */
  put: <T = unknown>(url: string, body?: unknown, config?: ApiClientConfig) =>
    apiRequest<T>(url, { method: 'PUT', body }, config),

  /** DELETE request. */
  delete: <T = unknown>(url: string, config?: ApiClientConfig) =>
    apiRequest<T>(url, { method: 'DELETE' }, config),
};
