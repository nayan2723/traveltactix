const CACHE_KEY = 'ai_recommendations_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedRecommendation {
  data: unknown;
  timestamp: number;
  userId?: string;
}

interface RecommendationCache {
  [key: string]: CachedRecommendation;
}

const getCacheKey = (type: string, userId?: string) => {
  return `${type}_${userId || 'anonymous'}`;
};

export const getAIRecommendationCache = (type: string, userId?: string): unknown | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cache: RecommendationCache = JSON.parse(raw);
    const key = getCacheKey(type, userId);
    const entry = cache[key];

    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      // Expired - remove from cache
      delete cache[key];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
};

export const setAIRecommendationCache = (
  type: string, 
  data: unknown, 
  userId?: string
): void => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const cache: RecommendationCache = raw ? JSON.parse(raw) : {};
    
    const key = getCacheKey(type, userId);
    cache[key] = {
      data,
      timestamp: Date.now(),
      userId,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Silently fail - cache is optional
  }
};

export const clearAIRecommendationCache = (type?: string, userId?: string): void => {
  try {
    if (!type) {
      localStorage.removeItem(CACHE_KEY);
      return;
    }

    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;

    const cache: RecommendationCache = JSON.parse(raw);
    const key = getCacheKey(type, userId);
    delete cache[key];
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Silently fail
  }
};

// Clean expired entries periodically
export const cleanExpiredCache = (): void => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;

    const cache: RecommendationCache = JSON.parse(raw);
    const now = Date.now();
    let hasChanges = false;

    for (const key of Object.keys(cache)) {
      if (now - cache[key].timestamp > CACHE_TTL_MS) {
        delete cache[key];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch {
    // Silently fail
  }
};
