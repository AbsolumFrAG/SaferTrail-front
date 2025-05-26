import {
  Coordinate,
  GeoJSONResponse,
  SafeRouteResponse,
  StreetSegment,
} from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0 && error instanceof Error) {
      console.warn(`Request failed, retrying... (${retries} attempts left)`);
      await sleep(RETRY_DELAY);
      return fetchWithRetry<T>(url, options, retries - 1);
    }
    throw error;
  }
}

export class RouteService {
  static async getSafeRoute(
    start: Coordinate,
    end: Coordinate,
    riskWeight = 0.7
  ): Promise<SafeRouteResponse> {
    const cacheKey = `route_${start.latitude}_${start.longitude}_${end.latitude}_${end.longitude}_${riskWeight}`;

    // Check cache first
    const cachedResult = apiCache.get<SafeRouteResponse>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const url = `${API_BASE_URL}/safe-route?start_lat=${start.latitude}&start_lon=${start.longitude}&end_lat=${end.latitude}&end_lon=${end.longitude}&risk_weight=${riskWeight}&format=json`;

    try {
      const result = await fetchWithRetry<SafeRouteResponse>(url);

      if (result.status === "success" && result.route) {
        apiCache.set(cacheKey, result);
        return result;
      }

      throw new Error("Invalid response from safe-route API");
    } catch (error) {
      console.error("Safe route API failed, attempting fallback:", error);
      return this.getOSRMRoute(start, end);
    }
  }

  static async getOSRMRoute(
    start: Coordinate,
    end: Coordinate
  ): Promise<SafeRouteResponse> {
    const url = `https://router.project-osrm.org/route/v1/foot/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;

    const response = await fetchWithRetry<any>(url);

    if (response.code !== "Ok" || !response.routes.length) {
      throw new Error("OSRM route calculation failed");
    }

    const route = response.routes[0];

    // Convert OSRM response to our format
    return {
      status: "success",
      route: {
        distance: route.distance,
        estimated_time: {
          formatted: route.estimated_time.formatted,
          hours: Math.floor(route.duration / 3600),
          minutes: Math.floor((route.duration % 3600) / 60),
          total_minutes: Math.floor(route.duration / 60),
          total_seconds: route.duration,
        },
        risk_score: 0.3, // Default moderate risk for OSRM routes
        risk_level: "medium",
        segments: [
          {
            street: "Unknown Street",
            length: route.distance,
            risk: 0.3,
            coordinates: route.geometry.coordinates,
          },
        ],
      },
      time: new Date().toISOString(),
    };
  }

  static clearCache(): void {
    apiCache.clear();
  }
}

export class StreetSegmentService {
  private static readonly CACHE_KEY = "street_segments";

  static async getStreetSegments(): Promise<StreetSegment[]> {
    // Check cache first
    const cachedSegments = apiCache.get<StreetSegment[]>(this.CACHE_KEY);
    if (cachedSegments) {
      return cachedSegments;
    }

    try {
      const response = await fetchWithRetry<GeoJSONResponse>(
        `${API_BASE_URL}/street-segments`
      );

      if (
        response.type === "FeatureCollection" &&
        Array.isArray(response.features)
      ) {
        apiCache.set(this.CACHE_KEY, response.features);
        return response.features;
      }

      throw new Error("Invalid GeoJSON format");
    } catch (error) {
      console.error("Failed to fetch street segments:", error);
      throw error;
    }
  }

  static clearCache(): void {
    apiCache.clear();
  }
}
