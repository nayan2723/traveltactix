import { useCallback } from 'react';

// Track prefetched routes to avoid duplicate prefetching
const prefetchedRoutes = new Set<string>();

// Route to component mapping for prefetching
const routeModules: Record<string, () => Promise<unknown>> = {
  '/missions': () => import('@/pages/Missions'),
  '/discovery': () => import('@/pages/Discovery'),
  '/dashboard': () => import('@/pages/Dashboard'),
  '/leaderboard': () => import('@/pages/Leaderboard'),
  '/shop': () => import('@/pages/Shop'),
  '/profile': () => import('@/pages/Profile'),
  '/favorites': () => import('@/pages/Favorites'),
};

export const useRoutePrefetch = () => {
  const prefetchRoute = useCallback((route: string) => {
    // Skip if already prefetched or route not in our map
    if (prefetchedRoutes.has(route) || !routeModules[route]) {
      return;
    }

    // Mark as prefetched immediately to prevent race conditions
    prefetchedRoutes.add(route);

    // Use requestIdleCallback for non-blocking prefetch
    const prefetch = () => {
      routeModules[route]?.().catch(() => {
        // Silently fail - route will load normally if prefetch fails
        prefetchedRoutes.delete(route);
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetch, { timeout: 2000 });
    } else {
      setTimeout(prefetch, 100);
    }
  }, []);

  const onHoverPrefetch = useCallback((route: string) => {
    return {
      onMouseEnter: () => prefetchRoute(route),
      onFocus: () => prefetchRoute(route),
    };
  }, [prefetchRoute]);

  return { prefetchRoute, onHoverPrefetch };
};
