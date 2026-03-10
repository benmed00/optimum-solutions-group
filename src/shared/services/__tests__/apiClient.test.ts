/**
 * @fileoverview Unit tests for API client
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { apiRequest, apiClient, ApiError } from '../apiClient';

/** Partial Response mock for fetch - apiClient only uses ok, status, headers, text() */
const createMockResponse = (overrides: Partial<Response> & { ok: boolean; status: number; text: () => Promise<string>; headers?: Headers }): Response =>
  overrides as unknown as Response;

describe('apiClient', () => {
  const originalFetch = global.fetch;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe('apiRequest', () => {
    it('should return JSON response on success', async () => {
      mockFetch.mockResolvedValue(createMockResponse({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{"id":1,"name":"test"}'),
      }));

      const result = await apiRequest<{ id: number; name: string }>('/test', { method: 'GET' });

      expect(result).toEqual({ id: 1, name: 'test' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValue(createMockResponse({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Not found'),
      }));

      await expect(apiRequest('/test')).rejects.toThrow(ApiError);
      await expect(apiRequest('/test')).rejects.toMatchObject({
        status: 404,
        message: expect.stringContaining('404'),
      });
    });

    it('should retry on 5xx errors', async () => {
      mockFetch
        .mockResolvedValueOnce(createMockResponse({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: () => Promise.resolve(''),
        }))
        .mockResolvedValueOnce(createMockResponse({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: () => Promise.resolve('{"success":true}'),
        }));

      const result = await apiRequest('/test', { method: 'GET' }, { retries: 2, retryDelay: 10 });

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx (except 408, 429)', async () => {
      mockFetch.mockResolvedValue(createMockResponse({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid'),
      }));

      await expect(apiRequest('/test', {}, { retries: 2 })).rejects.toThrow(ApiError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle empty 204 response', async () => {
      mockFetch.mockResolvedValue(createMockResponse({
        ok: true,
        status: 204,
        headers: new Headers({ 'content-length': '0' }),
        text: () => Promise.resolve(''),
      }));

      const result = await apiRequest('/test', { method: 'POST', body: {} });

      expect(result).toBeUndefined();
    });
  });

  describe('apiClient helpers', () => {
    it('should support GET', async () => {
      mockFetch.mockResolvedValue(createMockResponse({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{"data":1}'),
      }));

      const result = await apiClient.get<{ data: number }>('/api/data');

      expect(result).toEqual({ data: 1 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should support POST with body', async () => {
      mockFetch.mockResolvedValue(createMockResponse({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{"id":1}'),
      }));

      await apiClient.post('/api/create', { name: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });
  });

  describe('ApiError', () => {
    it('should have name ApiError', () => {
      const error = new ApiError('test', 500);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('test');
      expect(error.status).toBe(500);
    });
  });
});
