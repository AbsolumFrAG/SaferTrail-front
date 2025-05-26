import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { COLORS, RISK_THRESHOLDS } from "../constants";
import { RouteService } from "../services/api";
import {
  ColoredSegment,
  Coordinate,
  RouteInfo,
  SafeRouteResponse,
} from "../types";

const getColorFromRiskScore = (score: number): string => {
  if (score >= RISK_THRESHOLDS.HIGH) return COLORS.HIGH_RISK;
  if (score >= RISK_THRESHOLDS.MEDIUM) return COLORS.MEDIUM_RISK;
  return COLORS.LOW_RISK;
};

const convertGeoJSONCoordinates = (coordinates: number[][]): Coordinate[] => {
  return coordinates.map((coord) => ({
    latitude: coord[1],
    longitude: coord[0],
  }));
};

export function useRoute() {
  const [startPoint, setStartPoint] = useState<Coordinate | null>(null);
  const [endPoint, setEndPoint] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [coloredSegments, setColoredSegments] = useState<ColoredSegment[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const processRouteResponse = useCallback((data: SafeRouteResponse) => {
    const segments = data.route.segments;
    const routeSegments: ColoredSegment[] = [];
    const allCoordinates: Coordinate[] = [];

    segments.forEach((segment) => {
      const coordinates = convertGeoJSONCoordinates(segment.coordinates);
      const color = getColorFromRiskScore(segment.risk);
      const isDangerous = segment.risk >= RISK_THRESHOLDS.MEDIUM;

      routeSegments.push({
        coordinates,
        color,
        isDangerous,
        streetName: segment.street,
        risk: segment.risk,
      });

      allCoordinates.push(...coordinates);
    });

    setColoredSegments(routeSegments);
    setRoute(allCoordinates);

    setRouteInfo({
      travelTime: Math.round(data.route.estimated_time.minutes),
      safetyPercentage: Math.round((1 - data.route.risk_score) * 100),
      distance: data.route.distance,
      riskLevel: data.route.risk_level,
    });
  }, []);

  const calculateRoute = useCallback(
    async (start: Coordinate, end: Coordinate, riskWeight = 0.7) => {
      setLoading(true);
      setRoute([]);
      setColoredSegments([]);
      setRouteInfo(null);

      try {
        const data = await RouteService.getSafeRoute(start, end, riskWeight);
        processRouteResponse(data);
      } catch (error) {
        console.error("Route calculation failed:", error);
        Alert.alert("Error", "Failed to calculate route");
      } finally {
        setLoading(false);
      }
    },
    [processRouteResponse]
  );

  const findSaferRoute = useCallback(async () => {
    if (!startPoint || !endPoint) return;

    await calculateRoute(startPoint, endPoint, 0.9); // Higher risk weight for safer route
  }, [startPoint, endPoint, calculateRoute]);

  const setDestination = useCallback(
    (destination: Coordinate) => {
      setEndPoint(destination);
      if (startPoint) {
        calculateRoute(startPoint, destination);
      }
    },
    [startPoint, calculateRoute]
  );

  const resetRoute = useCallback(() => {
    setEndPoint(null);
    setRoute([]);
    setColoredSegments([]);
    setRouteInfo(null);
  }, []);

  const hasRoute = useMemo(() => route.length > 0, [route.length]);
  const canCalculateRoute = useMemo(
    () => startPoint !== null && endPoint !== null,
    [startPoint, endPoint]
  );

  return {
    startPoint,
    endPoint,
    route,
    coloredSegments,
    routeInfo,
    loading,
    hasRoute,
    canCalculateRoute,
    setStartPoint,
    setDestination,
    calculateRoute,
    findSaferRoute,
    resetRoute,
  };
}
