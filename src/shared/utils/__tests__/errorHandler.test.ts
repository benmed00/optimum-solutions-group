/**
 * @fileoverview Comprehensive test suite for error handling utilities
 * @description Tests for error handling, logging, and error recovery mechanisms
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { errorHandler, handleError, wrapAsync, wrapSync, getStoredErrors, clearStoredErrors } from '../errorHandler';

// Mock Date.now
const mockDateNow = jest.fn(() => 1640995200000); // 2022-01-01T00:00:00.000Z
global.Date.now = mockDateNow;

// Mock Date constructor to return consistent timestamps
const mockDate = new Date('2022-01-01T00:00:00.000Z');
global.Date = jest.fn(() => mockDate) as unknown as typeof Date;
global.Date.now = mockDateNow;


// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Error Handler utilities', () => {
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    // Mock console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    localStorageMock.getItem.mockReturnValue('[]');
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
    
    // Reset error handler instance
    (errorHandler as unknown as { errorCount: Map<string, number> }).errorCount.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ErrorHandler class', () => {
    describe('Singleton pattern', () => {
      it('should return the same instance', () => {
        const instance1 = errorHandler;
        const instance2 = errorHandler;
        expect(instance1).toBe(instance2);
      });
    });

    describe('Error logging', () => {
      it('should log errors in development mode', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        handleError('Test error', { component: 'TestComponent' });

        // Composite handler routes to Unhandled Error when no specialized handler matches
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Unhandled Error:',
          expect.objectContaining({
            message: 'Test error',
            context: expect.objectContaining({
              component: 'TestComponent',
              message: 'Test error',
              timestamp: expect.any(String),
              url: expect.any(String),
              userAgent: expect.any(String),
            }),
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should report errors in production mode', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        handleError('Production error', { component: 'TestComponent' });

        // Implementation uses composite handler + errorReportingService (in-memory)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Unhandled Error:',
          expect.objectContaining({ message: 'Production error' })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should include timestamp and URL in error context', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        handleError('Test error');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Unhandled Error:',
          expect.objectContaining({
            message: 'Test error',
            context: expect.objectContaining({
              timestamp: '2022-01-01T00:00:00.000Z',
              url: window.location.href,
              userAgent: navigator.userAgent,
            }),
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });
    });

    describe('Error rate limiting', () => {
      it('should limit errors per minute', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        // Clear the error count map to ensure clean state
        (errorHandler as unknown as { errorCount: Map<string, number> }).errorCount.clear();

        // Generate more than MAX_ERRORS_PER_MINUTE (10)
        for (let i = 0; i < 15; i++) {
          handleError('Rate limited error');
        }

        // Should only log first 10 errors (rate limiting kicks in after 10)
        expect(consoleErrorSpy).toHaveBeenCalledTimes(10);

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should reset error count after a minute', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        // Generate 10 errors
        for (let i = 0; i < 10; i++) {
          handleError('Rate limited error');
        }

        // Advance time by 1 minute
        jest.advanceTimersByTime(60000);

        // Should be able to log more errors now
        handleError('New error after reset');
        expect(consoleErrorSpy).toHaveBeenCalledTimes(11);

        process.env['NODE_ENV'] = originalEnv;
      });
    });

    describe('Global error handlers', () => {
      it('should handle unhandled promise rejections', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        handleError('Unhandled Promise Rejection', {
          reason: 'test reason',
          component: 'Global'
        });

        // PromiseErrorHandler matches context with reason
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Promise Error:',
          expect.objectContaining({
            message: 'Unhandled Promise Rejection',
            reason: 'test reason',
            reportId: expect.any(String),
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should handle global errors', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const errorEvent = new ErrorEvent('error', {
          message: 'Test error message',
          filename: 'test.js',
          lineno: 10,
          colno: 5,
          error: new Error('Test error'),
        });

        window.dispatchEvent(errorEvent);

        // BrowserErrorHandler matches context with filename/lineno/colno
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Browser Error:',
          expect.objectContaining({
            message: 'Test error message',
            filename: 'test.js',
            line: 10,
            column: 5,
            reportId: expect.any(String),
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should handle resource loading errors in development', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const img = document.createElement('img');
        img.src = 'invalid-image.jpg';

        const errorEvent = new Event('error');
        Object.defineProperty(errorEvent, 'target', {
          value: img,
          writable: false,
        });

        window.dispatchEvent(errorEvent);

        // ResourceErrorHandler logs "Resource Error:" with resourceType, resourceUrl
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Resource Error:',
          expect.objectContaining({
            resourceType: 'image',
            resourceUrl: expect.any(String),
            reportId: expect.any(String),
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });
    });
  });

  describe('Utility functions', () => {
    describe('wrapAsync', () => {
      it('should execute async function successfully', async () => {
        const mockFn = jest.fn() as jest.MockedFunction<() => Promise<string>>;
        mockFn.mockResolvedValue('success');
        const result = await wrapAsync(mockFn, { component: 'TestComponent' });

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalled();
      });

      it('should handle async function errors', async () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const mockFn = jest.fn() as jest.MockedFunction<() => Promise<never>>;
        mockFn.mockRejectedValue(new Error('Async error'));
        const result = await wrapAsync(mockFn, { component: 'TestComponent' });

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Unhandled Error:',
          expect.objectContaining({
            message: 'Async error',
            context: expect.objectContaining({ component: 'TestComponent' }),
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should handle non-Error rejections', async () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const mockFn = jest.fn() as jest.MockedFunction<() => Promise<never>>;
        mockFn.mockRejectedValue('String error');
        const result = await wrapAsync(mockFn);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Unhandled Error:',
          expect.objectContaining({
            message: 'String error',
            context: expect.any(Object),
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });
    });

    describe('wrapSync', () => {
      it('should execute sync function successfully', () => {
        const mockFn = jest.fn().mockReturnValue('success');
        const result = wrapSync(mockFn, { component: 'TestComponent' });

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalled();
      });

      it('should handle sync function errors', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const mockFn = jest.fn().mockImplementation(() => {
          throw new Error('Sync error');
        });
        const result = wrapSync(mockFn, { component: 'TestComponent' });

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Unhandled Error:',
          expect.objectContaining({
            message: 'Sync error',
            context: expect.objectContaining({ component: 'TestComponent' }),
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should handle non-Error exceptions', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const mockFn = jest.fn().mockImplementation(() => {
          throw 'String exception';
        });
        const result = wrapSync(mockFn);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Unhandled Error:',
          expect.objectContaining({
            message: 'String exception',
            context: expect.any(Object),
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });
    });

    describe('Error storage and retrieval', () => {
      it('should retrieve stored errors from localStorage', () => {
        const mockErrors = [
          { message: 'Error 1', timestamp: '2023-01-01T00:00:00.000Z' },
          { message: 'Error 2', timestamp: '2023-01-01T00:01:00.000Z' },
        ];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockErrors));

        const errors = getStoredErrors();

        expect(errors).toEqual(mockErrors);
        expect(localStorageMock.getItem).toHaveBeenCalledWith('app_errors');
      });

      it('should handle corrupted localStorage data', () => {
        localStorageMock.getItem.mockReturnValue('invalid json');

        const errors = getStoredErrors();

        expect(errors).toEqual([]);
      });

      it('should clear stored errors', () => {
        clearStoredErrors();

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('app_errors');
      });
    });
  });

  describe('Error context handling', () => {
    it('should route to UserErrorHandler when context has action', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      const customContext = {
        component: 'CustomComponent',
        action: 'testAction',
        data: { key: 'value' },
      };

      handleError('Test error', customContext);

      // UserErrorHandler matches context with action
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'User Error:',
        expect.objectContaining({
          message: 'Test error',
          action: 'testAction',
          reportId: expect.any(String),
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });

    it('should handle empty context', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      handleError('Test error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unhandled Error:',
        expect.objectContaining({
          message: 'Test error',
          context: expect.objectContaining({
            timestamp: expect.any(String),
            url: expect.any(String),
            userAgent: expect.any(String),
          }),
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });

    it('should handle context with undefined values', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      const contextWithUndefined = {
        component: 'TestComponent',
      };

      handleError('Test error', contextWithUndefined);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unhandled Error:',
        expect.objectContaining({
          message: 'Test error',
          context: expect.objectContaining({ component: 'TestComponent' }),
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle rapid error generation efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        handleError(`Error ${i}`);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Should not throw
      expect(() => {
        handleError('Test error');
      }).not.toThrow();
    });

    it('should handle missing localStorage gracefully', () => {
      // Mock localStorage as undefined
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      expect(() => {
        handleError('Test error');
        getStoredErrors();
        clearStoredErrors();
      }).not.toThrow();

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should work with React error boundaries', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      handleError('React Error Boundary', {
        error: new Error('React error'),
        component: 'ErrorBoundary',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unhandled Error:',
        expect.objectContaining({
          message: 'React Error Boundary',
          context: expect.objectContaining({
            component: 'ErrorBoundary',
          }),
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });

    it('should work with API error handling', async () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      const apiCall = async () => {
        throw new Error('API request failed');
      };

      const result = await wrapAsync(apiCall, {
        component: 'ApiService',
        action: 'fetchUserData',
      });

      expect(result).toBeNull();
      // UserErrorHandler matches context with action
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'User Error:',
        expect.objectContaining({
          message: 'API request failed',
          action: 'fetchUserData',
          reportId: expect.any(String),
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });

    it('should work with form validation errors', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      const validateForm = () => {
        throw new Error('Validation failed');
      };

      const result = wrapSync(validateForm, {
        component: 'FormValidator',
        action: 'validateEmail',
      });

      expect(result).toBeNull();
      // UserErrorHandler matches context with action
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'User Error:',
        expect.objectContaining({
          message: 'Validation failed',
          action: 'validateEmail',
          reportId: expect.any(String),
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });
  });
});
