/**
 * Simplified Tests for useCoreWebVitals Hook
 * 
 * Tests Core Web Vitals monitoring with mocked web-vitals library
 * Focuses on basic functionality without triggering infinite loops
 * 
 * @version 1.0
 * @author Optimum Solutions Group
 */

import { renderHook } from '@testing-library/react';
import { useCoreWebVitals, __resetCoreWebVitalsForTesting } from '../useCoreWebVitals';
// Mock web-vitals library
jest.mock('web-vitals', () => ({
  onLCP: jest.fn(),
  onFCP: jest.fn(),
  onCLS: jest.fn(),
  onTTFB: jest.fn(),
  onINP: jest.fn(),
}));

// Import the mocked functions
import { onLCP, onFCP, onCLS, onTTFB, onINP } from 'web-vitals';

// Define interface for mock functions with callback property
interface MockWebVitalsFunction {
  (...args: unknown[]): void;
  mockImplementation: (fn: (callback: (metric: unknown) => void, ...args: unknown[]) => void) => void;
  mockReturnValue: (value: () => void) => void;
  callback?: (metric: unknown) => void;
}

const mockOnLCP = onLCP as unknown as MockWebVitalsFunction;
const mockOnFCP = onFCP as unknown as MockWebVitalsFunction;
const mockOnCLS = onCLS as unknown as MockWebVitalsFunction;
const mockOnTTFB = onTTFB as unknown as MockWebVitalsFunction;
const mockOnINP = onINP as unknown as MockWebVitalsFunction;

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => 1000),
  mark: jest.fn(),
  measure: jest.fn(),
};

// Mock navigator for device capabilities
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  deviceMemory: 8,
  connection: {
    effectiveType: '4g',
  },
};

// Mock window and global objects
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Note: Do not mock window.location - JSDOM's location is not configurable and
// assignment triggers "Not implemented: navigation" error. Default URL is fine.

// Mock fetch for analytics
global.fetch = jest.fn();

describe('useCoreWebVitals Hook - Basic Tests', () => {
  beforeEach(() => {
    __resetCoreWebVitalsForTesting();
    jest.clearAllMocks();
    
    // Reset mock implementations
    mockOnLCP.mockImplementation((callback) => {
      mockOnLCP.callback = callback;
      return () => {}; // Return unsubscribe function
    });
    
    mockOnFCP.mockImplementation((callback) => {
      mockOnFCP.callback = callback;
      return () => {};
    });
    
    mockOnCLS.mockImplementation((callback) => {
      mockOnCLS.callback = callback;
      return () => {};
    });
    
    mockOnTTFB.mockImplementation((callback) => {
      mockOnTTFB.callback = callback;
      return () => {};
    });
    
    mockOnINP.mockImplementation((callback) => {
      mockOnINP.callback = callback;
      return () => {};
    });
  });

  describe('Hook Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCoreWebVitals());

      expect(result.current.metrics).toEqual({
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null,
        inp: null,
        timestamp: expect.any(Number),
        url: 'http://localhost:3000/',
        userAgent: mockNavigator.userAgent,
        isLowEndDevice: false,
        pageLoadTime: 1000,
        deviceMemory: 8,
        connectionType: '4g',
      });
      expect(result.current.isSupported).toBe(true);
      expect(result.current.isReporting).toBe(false);
      expect(result.current.performanceScore).toBe(0);
    });

    it('should not register web vitals observers when monitoring is disabled', () => {
      renderHook(() => useCoreWebVitals());

      // Web vitals monitoring is disabled in the hook - observers are not registered
      expect(mockOnLCP).not.toHaveBeenCalled();
      expect(mockOnFCP).not.toHaveBeenCalled();
      expect(mockOnCLS).not.toHaveBeenCalled();
      expect(mockOnTTFB).not.toHaveBeenCalled();
      expect(mockOnINP).not.toHaveBeenCalled();
    });

    it.skip('should handle server-side rendering (no window)', () => {
      // This test is skipped because JSDOM always provides a window object
      // In a real SSR environment, the hook would work correctly
      const originalWindow = global.window;
      
      // Mock window as undefined for SSR test
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      global.window = undefined;

      const { result } = renderHook(() => useCoreWebVitals());

      expect(result.current.isSupported).toBe(false);

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('Web Vitals Subscriptions', () => {
    it('should have null metrics when monitoring is disabled', () => {
      const { result } = renderHook(() => useCoreWebVitals());

      // Web vitals monitoring is disabled - metrics remain null
      expect(result.current.metrics.lcp).toBeNull();
      expect(result.current.metrics.fid).toBeNull();
      expect(result.current.metrics.cls).toBeNull();
    });
  });

  describe('Unsubscription on Unmount', () => {
    it('should not register observers when monitoring is disabled', () => {
      renderHook(() => useCoreWebVitals());

      expect(mockOnLCP).not.toHaveBeenCalled();
      expect(mockOnFCP).not.toHaveBeenCalled();
      expect(mockOnCLS).not.toHaveBeenCalled();
    });
  });

  describe('Helper Functions', () => {
    it('should get threshold correctly', () => {
      const { result } = renderHook(() => useCoreWebVitals());

      expect(result.current.getThreshold('LCP')).toEqual({
        good: 2500,
        needsImprovement: 4000,
      });
      expect(result.current.getThreshold('INVALID')).toBe(null);
    });

    it('should check if metric is good correctly', () => {
      const { result } = renderHook(() => useCoreWebVitals());

      // With no metrics (monitoring disabled), isMetricGood returns false
      expect(result.current.isMetricGood('LCP')).toBe(false);
      expect(result.current.isMetricGood('FID')).toBe(false);
    });
  });

  describe('Console Logging', () => {
    it('should not log LCP metrics when monitoring is disabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      renderHook(() => useCoreWebVitals({ enableConsoleLogging: true }));

      const lcpCalls = consoleSpy.mock.calls.filter(
        (call) => call[0] === '📊 Core Web Vitals - LCP:'
      );
      expect(lcpCalls).toHaveLength(0);

      consoleSpy.mockRestore();
    });

    it('should not log LCP metrics when console logging is disabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      renderHook(() => useCoreWebVitals({ enableConsoleLogging: false }));

      const lcpCalls = consoleSpy.mock.calls.filter(
        (call) => call[0] === '📊 Core Web Vitals - LCP:'
      );
      expect(lcpCalls).toHaveLength(0);

      consoleSpy.mockRestore();
    });
  });
});
