import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Generate a unique session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get device info
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  if (/mobile/i.test(ua)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';
  
  let browser = 'unknown';
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';
  
  return { deviceType, browser };
};

export type EventType = 
  | 'page_view'
  | 'feature_usage'
  | 'mission_action'
  | 'social_action'
  | 'error'
  | 'performance';

interface TrackEventOptions {
  eventType: EventType;
  eventName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const location = useLocation();
  const sessionStartRef = useRef<number>(Date.now());
  const pageViewCountRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize or update session with abort support
  const initSession = useCallback(async () => {
    if (!user) return;

    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const sessionId = getSessionId();
    const { deviceType, browser } = getDeviceInfo();

    try {
      const { error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          started_at: new Date(sessionStartRef.current).toISOString(),
          device_type: deviceType,
          browser: browser,
          page_views: pageViewCountRef.current,
        }, {
          onConflict: 'session_id',
        });

      if (error && !abortControllerRef.current?.signal.aborted) {
        console.error('Session init error:', error);
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error('Session tracking error:', err);
      }
    }
  }, [user]);

  // Track an event with abort support
  const trackEvent = useCallback(async ({ eventType, eventName, metadata = {} }: TrackEventOptions) => {
    const sessionId = getSessionId();

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          user_id: user?.id ?? null,
          event_type: eventType,
          event_name: eventName,
          page_path: location.pathname,
          session_id: sessionId,
          metadata,
        }]);

      if (error) console.error('Event tracking error:', error);
    } catch (err) {
      console.error('Analytics error:', err);
    }
  }, [user, location.pathname]);

  // Track page view
  const trackPageView = useCallback(() => {
    pageViewCountRef.current += 1;
    trackEvent({
      eventType: 'page_view',
      eventName: 'page_viewed',
      metadata: {
        path: location.pathname,
        title: document.title,
        referrer: document.referrer,
      },
    });
  }, [location.pathname, trackEvent]);

  // Track feature usage
  const trackFeature = useCallback((featureName: string, action: string, metadata?: Record<string, any>) => {
    trackEvent({
      eventType: 'feature_usage',
      eventName: `${featureName}_${action}`,
      metadata: { feature: featureName, action, ...metadata },
    });
  }, [trackEvent]);

  // Track mission actions
  const trackMission = useCallback((missionId: string, action: string, metadata?: Record<string, any>) => {
    trackEvent({
      eventType: 'mission_action',
      eventName: `mission_${action}`,
      metadata: { missionId, action, ...metadata },
    });
  }, [trackEvent]);

  // Track social actions
  const trackSocial = useCallback((action: string, metadata?: Record<string, any>) => {
    trackEvent({
      eventType: 'social_action',
      eventName: `social_${action}`,
      metadata: { action, ...metadata },
    });
  }, [trackEvent]);

  // Auto-track page views on route change
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  // Initialize session on mount
  useEffect(() => {
    if (user) {
      initSession();
    }

    // Cleanup: abort any pending requests and update session
    return () => {
      // Abort any pending async operations
      abortControllerRef.current?.abort();
      
      if (user) {
        const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
        // Use sendBeacon for reliable cleanup (non-blocking)
        const sessionData = {
          ended_at: new Date().toISOString(),
          duration_seconds: duration,
          page_views: pageViewCountRef.current,
        };
        
        // Fire-and-forget update - don't await in cleanup
        supabase
          .from('user_sessions')
          .update(sessionData)
          .eq('session_id', getSessionId())
          .then(() => {});
      }
    };
  }, [user, initSession]);

  return {
    trackEvent,
    trackPageView,
    trackFeature,
    trackMission,
    trackSocial,
  };
};

// Hook for fetching analytics data (for dashboards)
export const useAnalyticsData = () => {
  const { user } = useAuth();

  const fetchUserStats = useCallback(async () => {
    if (!user) return null;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [eventsResult, sessionsResult] = await Promise.all([
      supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', thirtyDaysAgo.toISOString())
        .order('started_at', { ascending: false }),
    ]);

    return {
      events: eventsResult.data || [],
      sessions: sessionsResult.data || [],
    };
  }, [user]);

  const fetchDailyStats = useCallback(async (days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('analytics_daily_stats')
      .select('*')
      .gte('stat_date', startDate.toISOString().split('T')[0])
      .order('stat_date', { ascending: true });

    if (error) {
      console.error('Error fetching daily stats:', error);
      return [];
    }

    return data || [];
  }, []);

  return {
    fetchUserStats,
    fetchDailyStats,
  };
};
