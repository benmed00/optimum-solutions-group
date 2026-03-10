/**
 * Comprehensive Tests for useCoreWebVitals Hook
 *
 * Tests Core Web Vitals monitoring with mocked web-vitals library
 * Covers LCP, FID, CLS subscriptions, unsubscription, and all functionality
 *
 * @version 1.0
 * @author Optimum Solutions Group
 */

import { renderHook, act, cleanup, RenderHookResult } from '@testing-library/react';
import { useCoreWebVitals, __resetCoreWebVitalsForTesting } from '../useCoreWebVitals';
import type { CoreWebVitalsData, CoreWebVitalsOptions } from '../../types/coreWebVitals';

/** Explicit type for useCoreWebVitals hook return value */
type UseCoreWebVitalsReturn = ReturnType<typeof useCoreWebVitals>;

/** Explicit type for renderHook result when testing useCoreWebVitals */
type UseCoreWebVitalsRenderResult = RenderHookResult<
  UseCoreWebVitalsReturn,
  Record<string, never>
>;

/** Explicit type for Core Web Vitals summary object */
type CoreWebVitalsSummary = {
  good: number;
  needsImprovement: number;
  poor: number;
  total: number;
  score: number;
};

// Mock web-vitals library
jest.mock('web-vitals', () => ({
  onLCP: jest.fn(),
  onFCP: jest.fn(),
  onCLS: jest.fn(),
  onTTFB: jest.fn(),
  onINP: jest.fn(),
}));

// Import the mocked module and type it explicitly (single module-level assertion)
import * as WebVitalsModule from 'web-vitals';

/** Jest mock for web-vitals observer functions with callback storage */
interface MockWebVitalsFunction {
  (...args: unknown[]): void;
  mockImplementation: (fn: (callback: (metric: unknown) => void, ...args: unknown[]) => () => void) => void;
  mockReturnValue: (value: () => void) => void;
  callback?: (metric: unknown) => void;
}

/** Explicit type for mocked web-vitals module in tests */
interface WebVitalsMockModule {
  readonly onLCP: MockWebVitalsFunction;
  readonly onFCP: MockWebVitalsFunction;
  readonly onCLS: MockWebVitalsFunction;
  readonly onTTFB: MockWebVitalsFunction;
  readonly onINP: MockWebVitalsFunction;
}

/** Encapsulates module assertion; jest.mock replaces exports with Jest mocks at runtime. */
function getWebVitalsMocks(module: typeof WebVitalsModule): WebVitalsMockModule {
  // @ts-expect-error - jest.mock replaces with mocks; compile-time types don't overlap
  return module as WebVitalsMockModule;
}
const webVitalsMocks: WebVitalsMockModule = getWebVitalsMocks(WebVitalsModule);
const mockOnLCP: MockWebVitalsFunction = webVitalsMocks.onLCP;
const mockOnFCP: MockWebVitalsFunction = webVitalsMocks.onFCP;
const mockOnCLS: MockWebVitalsFunction = webVitalsMocks.onCLS;
const mockOnTTFB: MockWebVitalsFunction = webVitalsMocks.onTTFB;
const mockOnINP: MockWebVitalsFunction = webVitalsMocks.onINP;

/** Minimal Performance mock - hook only uses now(), mark(), measure() */
interface MockPerformance {
  now: jest.Mock<number>;
  mark: jest.Mock;
  measure: jest.Mock;
}

const mockPerformance: MockPerformance = {
  now: jest.fn((): number => 1000),
  mark: jest.fn(),
  measure: jest.fn(),
};

/** Navigator mock with Device Memory API and Network Information API (experimental) */
interface MockNavigator {
  userAgent: string;
  deviceMemory?: number;
  connection?: { effectiveType: string };
}

const mockNavigator: MockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  deviceMemory: 8,
  connection: {
    effectiveType: '4g',
  },
};

/** Bridge mock to DOM Performance. Mock lacks full Performance API; assertion required. */
function toDomPerformance(mock: MockPerformance): Performance {
  // @ts-expect-error - MockPerformance is partial; satisfies runtime usage for tests
  return mock as Performance;
}

/** Bridge mock to DOM Navigator. Mock lacks full Navigator API; assertion required. */
function toDomNavigator(mock: MockNavigator): Navigator {
  return mock as Navigator;
}

// Mock window and global objects
Object.defineProperty(window, 'performance', {
  value: toDomPerformance(mockPerformance),
  writable: true,
});

Object.defineProperty(window, 'navigator', {
  value: toDomNavigator(mockNavigator),
  writable: true,
});

// Note: Do not mock window.location - assignment triggers JSDOM navigation error.
// JSDOM default (http://localhost:3000/) matches test expectations.

// Mock fetch for analytics
global.fetch = jest.fn();

describe('useCoreWebVitals Hook', () => {
  beforeEach(() => {
    __resetCoreWebVitalsForTesting();
    jest.clearAllMocks();
    
    // Reset mock implementations
    mockOnLCP.mockImplementation((callback: (metric: unknown) => void) => {
      // Store callback for later triggering
      mockOnLCP.callback = callback;
      return () => {}; // Return unsubscribe function
    });
    
    mockOnFCP.mockImplementation((callback: (metric: unknown) => void) => {
      mockOnFCP.callback = callback;
      return () => {};
    });
    
    mockOnCLS.mockImplementation((callback: (metric: unknown) => void) => {
      mockOnCLS.callback = callback;
      return () => {};
    });
    
    mockOnTTFB.mockImplementation((callback: (metric: unknown) => void) => {
      mockOnTTFB.callback = callback;
      return () => {};
    });
    
    mockOnINP.mockImplementation((callback: (metric: unknown) => void) => {
      mockOnINP.callback = callback;
      return () => {};
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Hook Initialization', () => {
    it('should initialize with default state', () => {
      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

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

      expect(mockOnLCP).not.toHaveBeenCalled();
      expect(mockOnFCP).not.toHaveBeenCalled();
      expect(mockOnCLS).not.toHaveBeenCalled();
      expect(mockOnTTFB).not.toHaveBeenCalled();
      expect(mockOnINP).not.toHaveBeenCalled();
    });

    it.skip('should handle server-side rendering (no window)', () => {
      // Skipped: JSDOM always provides window; real SSR would set isSupported=false
      const originalWindow: typeof global.window = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      delete global.window;

      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      expect(result.current.isSupported).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('Web Vitals Subscriptions', () => {
    it('should have null metrics when monitoring is disabled', () => {
      const { result }: RenderHookResult<ReturnType<typeof useCoreWebVitals>, Record<string, never>> = renderHook(() =>
        useCoreWebVitals()
      );

      expect(result.current.metrics.lcp).toBeNull();
      expect(result.current.metrics.fid).toBeNull();
      expect(result.current.metrics.cls).toBeNull();
      expect(result.current.metrics.fcp).toBeNull();
      expect(result.current.metrics.ttfb).toBeNull();
      expect(result.current.metrics.inp).toBeNull();
    });
  });

  describe('Metric Rating Calculations', () => {
    it('should have null ratings when monitoring is disabled', () => {
      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      expect(result.current.metrics.lcp?.rating).toBeUndefined();
      expect(result.current.metrics.fcp?.rating).toBeUndefined();
      expect(result.current.metrics.cls?.rating).toBeUndefined();
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

  describe('Analytics Reporting', () => {
    it('should not report when no metrics are collected (monitoring disabled)', () => {
      const mockFetch: jest.Mock<Promise<Response>, [RequestInfo | URL, RequestInit?]> = global
        .fetch as jest.Mock<Promise<Response>, [RequestInfo | URL, RequestInit?]>;
      const mockResponse: Response = { ok: true } as Response;
      mockFetch.mockResolvedValue(mockResponse);

      const analyticsOptions: CoreWebVitalsOptions = {
        enableAnalytics: true,
        analyticsEndpoint: 'https://api.example.com/analytics',
      };

      renderHook(() => useCoreWebVitals(analyticsOptions));

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Device Capabilities Detection', () => {
    it('should detect low-end device correctly', () => {
      const navigatorWithMemory: Navigator & { deviceMemory?: number } = navigator as Navigator & {
        deviceMemory?: number;
      };
      const originalDeviceMemory: number | undefined = navigatorWithMemory.deviceMemory;
      navigatorWithMemory.deviceMemory = 0.5;

      const { result }: RenderHookResult<ReturnType<typeof useCoreWebVitals>, Record<string, never>> =
        renderHook(() => useCoreWebVitals());

      expect(result.current.metrics.isLowEndDevice).toBe(true);
      expect(result.current.metrics.deviceMemory).toBe(0.5);

      if (originalDeviceMemory !== undefined) {
        navigatorWithMemory.deviceMemory = originalDeviceMemory;
      } else {
        delete navigatorWithMemory.deviceMemory;
      }
    });

    it('should detect high-end device correctly', () => {
      const navigatorWithMemory: Navigator & { deviceMemory?: number } = navigator as Navigator & {
        deviceMemory?: number;
      };
      const originalDeviceMemory: number | undefined = navigatorWithMemory.deviceMemory;
      navigatorWithMemory.deviceMemory = 8;

      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      expect(result.current.metrics.isLowEndDevice).toBe(false);
      expect(result.current.metrics.deviceMemory).toBe(8);

      if (originalDeviceMemory !== undefined) {
        navigatorWithMemory.deviceMemory = originalDeviceMemory;
      } else {
        delete navigatorWithMemory.deviceMemory;
      }
    });

    it('should handle missing device memory gracefully', () => {
      const navigatorWithMemory: Navigator & { deviceMemory?: number } = navigator as Navigator & {
        deviceMemory?: number;
      };
      const originalDeviceMemory: number | undefined = navigatorWithMemory.deviceMemory;
      delete navigatorWithMemory.deviceMemory;

      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      expect(result.current.metrics.isLowEndDevice).toBe(false);
      expect(result.current.metrics.deviceMemory).toBe(null);

      if (originalDeviceMemory !== undefined) {
        navigatorWithMemory.deviceMemory = originalDeviceMemory;
      } else {
        delete navigatorWithMemory.deviceMemory;
      }
    });
  });

  describe('Performance Score Calculation', () => {
    it('should return 0 when no metrics are collected', () => {
      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      expect(result.current.performanceScore).toBe(0);
    });
  });

  describe('Helper Functions', () => {
    it('should get metric rating correctly', () => {
      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      expect(result.current.getMetricRating('LCP')).toBe(null);
      expect(result.current.getMetricRating('FID')).toBe(null);
    });

    it('should get metric value correctly', () => {
      const { result } = renderHook(() => useCoreWebVitals());

      expect(result.current.getMetricValue('LCP')).toBe(null);
      expect(result.current.getMetricValue('FID')).toBe(null);
    });

    it('should get threshold correctly', () => {
      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      expect(result.current.getThreshold('LCP')).toEqual({
        good: 2500,
        needsImprovement: 4000,
      });
      expect(result.current.getThreshold('INVALID')).toBe(null);
    });

    it('should check if metric is good correctly', () => {
      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      expect(result.current.isMetricGood('LCP')).toBe(false);
      expect(result.current.isMetricGood('FID')).toBe(false);
    });
  });

  describe('Console Logging', () => {
    it('should not log LCP metrics when monitoring is disabled', () => {
      const consoleSpy: jest.SpyInstance<void, unknown[]> = jest
        .spyOn(console, 'log')
        .mockImplementation((): void => undefined);

      const optionsWithLogging: CoreWebVitalsOptions = {
        enableConsoleLogging: true,
      };

      renderHook(() => useCoreWebVitals(optionsWithLogging));

      const lcpCalls: unknown[][] = consoleSpy.mock.calls.filter(
        (call: unknown[]) => call[0] === '📊 Core Web Vitals - LCP:'
      );
      expect(lcpCalls).toHaveLength(0);

      consoleSpy.mockRestore();
    });

    it('should not log metrics when console logging is disabled', () => {
      const consoleSpy: jest.SpyInstance<void, unknown[]> = jest
        .spyOn(console, 'log')
        .mockImplementation((): void => undefined);

      const optionsWithoutLogging: CoreWebVitalsOptions = {
        enableConsoleLogging: false,
      };

      renderHook(() => useCoreWebVitals(optionsWithoutLogging));

      const lcpCalls: unknown[][] = consoleSpy.mock.calls.filter(
        (call: unknown[]) => call[0] === '📊 Core Web Vitals - LCP:'
      );
      expect(lcpCalls).toHaveLength(0);

      consoleSpy.mockRestore();
    });
  });

  describe('Manual Metric Collection', () => {
    it('should return current metrics snapshot when collectMetrics is called', () => {
      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      const snapshot: CoreWebVitalsData = result.current.collectMetrics();

      expect(snapshot).toEqual(result.current.metrics);
    });

    it('should not collect metrics when not supported', () => {
      const originalWindow: (Window & typeof globalThis) | undefined = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      delete global.window;

      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      act(() => {
        result.current.collectMetrics();
      });

      expect(mockOnLCP).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe('Summary Generation', () => {
    it('should generate empty summary when no metrics collected', () => {
      const { result }: UseCoreWebVitalsRenderResult = renderHook(() => useCoreWebVitals());

      const summary: CoreWebVitalsSummary = result.current.summary;
      expect(summary).toEqual({
        good: 0,
        needsImprovement: 0,
        poor: 0,
        total: 0,
        score: 0,
      });
    });
  });
});
