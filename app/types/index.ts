export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface ColoredSegment {
  coordinates: Coordinate[];
  color: string;
  isDangerous: boolean;
  streetName?: string;
  risk?: number;
}

export interface StreetSegment {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][];
  };
  properties: {
    street_name?: string;
    risk_score: number;
    risk_level?: string;
    color?: string;
  };
}

export interface GeoJSONResponse {
  type: string;
  features: StreetSegment[];
}

export interface SafeRouteResponse {
  status: string;
  route: {
    distance: number;
    estimated_time: {
      formatted: string;
      hours: number;
      minutes: number;
      total_minutes: number;
      total_seconds: number;
    };
    risk_score: number;
    risk_level: string;
    segments: RouteSegment[];
  };
  time: string;
}

export interface RouteSegment {
  street: string;
  length: number;
  risk: number;
  coordinates: number[][];
}

export interface RouteInfo {
  travelTime: number;
  safetyPercentage: number;
  distance: number;
  riskLevel: string;
}

export interface MapState {
  startPoint: Coordinate | null;
  endPoint: Coordinate | null;
  route: Coordinate[];
  coloredSegments: ColoredSegment[];
  streetSegments: StreetSegment[];
  routeInfo: RouteInfo | null;
  loading: boolean;
  loadingSegments: boolean;
}

export interface LocationPermissionResult {
  granted: boolean;
  location: Coordinate | null;
}
