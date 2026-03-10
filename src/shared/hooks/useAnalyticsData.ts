/**
 * React Query hook for analytics dashboard data.
 * Provides caching, deduplication, and loading/error states.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import analytics, { type AnalyticsEvent, type UserSession } from '@/shared/services/analytics';
import { apiClient } from '@/shared/services/apiClient';

export interface AnalyticsData {
  events: AnalyticsEvent[];
  session: UserSession;
  metrics: {
    totalPageViews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
    bounceRate: number;
    totalEvents: number;
    conversionRate: number;
  };
  deviceBreakdown: Array<{ name: string; value: number; percentage: number }>;
  topPages: Array<{ url: string; views: number; time: number }>;
  eventsByCategory: Array<{ category: string; count: number }>;
  timeSeriesData: Array<{ timestamp: string; events: number; users: number }>;
  performanceMetrics: {
    avgLCP: number;
    avgFID: number;
    avgCLS: number;
    avgFCP: number;
    avgTTFB: number;
  };
}

async function fetchAnalyticsFromApi(endpoint: string, timeRange: string): Promise<AnalyticsData> {
  const response = await apiClient.get<AnalyticsData>(
    `${endpoint.replace(/\/$/, '')}/report?range=${timeRange}`
  );
  return response;
}

function getSimulatedData(session: UserSession, events: AnalyticsEvent[]): AnalyticsData {
  return {
    events,
    session,
    metrics: {
      totalPageViews: session.pageViews || 1,
      uniqueVisitors: 1,
      averageSessionDuration: session.duration / 1000 / 60,
      bounceRate: session.bounceRate ? 100 : 0,
      totalEvents: events.length,
      conversionRate: 0,
    },
    deviceBreakdown: [
      { name: 'Desktop', value: 65, percentage: 65 },
      { name: 'Mobile', value: 30, percentage: 30 },
      { name: 'Tablet', value: 5, percentage: 5 },
    ],
    topPages: [
      { url: '/', views: session.pageViews || 1, time: session.timeOnPage / 1000 },
    ],
    eventsByCategory: [
      { category: 'navigation', count: session.pageViews || 1 },
      { category: 'engagement', count: session.interactions || 0 },
    ],
    timeSeriesData: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), events: 5, users: 3 },
      { timestamp: new Date(Date.now() - 1800000).toISOString(), events: 8, users: 5 },
      { timestamp: new Date().toISOString(), events: session.interactions + session.pageViews, users: 1 },
    ],
    performanceMetrics: {
      avgLCP: 2200,
      avgFID: 80,
      avgCLS: 0.08,
      avgFCP: 1800,
      avgTTFB: 600,
    },
  };
}

export function useAnalyticsData(
  timeRange: '1h' | '24h' | '7d' | '30d' | '90d' = '24h',
  options?: Omit<UseQueryOptions<AnalyticsData>, 'queryKey' | 'queryFn'>
) {
  const apiEndpoint = import.meta.env['VITE_ANALYTICS_API_ENDPOINT'] as string | undefined;

  return useQuery({
    queryKey: ['analytics', timeRange, apiEndpoint ?? 'local'],
    queryFn: async (): Promise<AnalyticsData> => {
      if (apiEndpoint) {
        try {
          return await fetchAnalyticsFromApi(apiEndpoint, timeRange);
        } catch {
          // Fallback to local data when API fails
          const session = analytics.getSession();
          return getSimulatedData(session, []);
        }
      }
      const session = analytics.getSession();
      return getSimulatedData(session, []);
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    ...options,
  });
}
