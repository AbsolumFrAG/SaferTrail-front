export const PERFORMANCE_CONFIG = {
  // API caching
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // Map optimization
  MAP_CLUSTERING_THRESHOLD: 100,
  MAX_POLYLINES_RENDERED: 1000,

  // Location updates
  LOCATION_UPDATE_INTERVAL: 10000, // 10 seconds
  LOCATION_ACCURACY_THRESHOLD: 50, // 50 meters

  // Memory management
  MAX_CACHED_ROUTES: 10,
  CLEANUP_INTERVAL: 30 * 60 * 1000, // 30 minutes
} as const;
