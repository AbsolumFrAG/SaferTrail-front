import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { COLORS, RISK_THRESHOLDS } from "../constants";
import { RouteService, StreetSegmentService } from "../services/api";
import {
  ColoredSegment,
  Coordinate,
  RouteInfo,
  SafeRouteResponse,
} from "../../types";

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

function useRoute() {
  const [startPoint, setStartPoint] = useState<Coordinate | null>(null);
  const [endPoint, setEndPoint] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [coloredSegments, setColoredSegments] = useState<ColoredSegment[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSafeRoute, setIsSafeRoute] = useState(false);

  // Load street segments at startup
  useEffect(() => {
    const loadStreetSegments = async () => {
      try {
        const segments = await StreetSegmentService.getStreetSegments();
        const coloredSegments: ColoredSegment[] = segments.map((segment) => ({
          coordinates: convertGeoJSONCoordinates(segment.geometry.coordinates),
          color: getColorFromRiskScore(segment.properties.risk_score),
          isDangerous: segment.properties.risk_score >= RISK_THRESHOLDS.MEDIUM,
          streetName: segment.properties.street_name || "Unknown Street",
          risk: segment.properties.risk_score,
        }));
        setColoredSegments(coloredSegments);
      } catch (error) {
        if (__DEV__) {
          console.log("Failed to load street segments:", error);
        }
      }
    };

    loadStreetSegments();
  }, []);

  const processRouteResponse = useCallback(
    (data: SafeRouteResponse, isFastRoute: boolean = false) => {
      if (!data || !data.route) return;

      const segments = data.route.segments;
      const routeSegments: ColoredSegment[] = [];
      const allCoordinates: Coordinate[] = [];

      segments.forEach((segment) => {
        const coordinates = convertGeoJSONCoordinates(segment.coordinates);
        const color = isFastRoute
          ? COLORS.MEDIUM_RISK
          : getColorFromRiskScore(segment.risk);
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

      setRoute(allCoordinates);
      setColoredSegments(routeSegments);
      setRouteInfo({
        travelTime: Math.round(data.route.estimated_time.total_minutes),
        safetyPercentage: Math.round((1 - data.route.risk_score) * 100),
        distance: data.route.distance,
        riskLevel: data.route.risk_level,
      });
    },
    []
  );

  const resetRoute = useCallback(() => {
    setEndPoint(null);
    setRoute([]);
    setColoredSegments([]);
    setRouteInfo(null);
  }, []);

  const calculateRoute = useCallback(
    async (start: Coordinate, end: Coordinate, isFastRoute: boolean = true) => {
      if (!start || !end) return;

      setLoading(true);
      setRoute([]);
      setColoredSegments([]);
      setRouteInfo(null);

      try {
        const data = isFastRoute
          ? await RouteService.getOpenRouteServiceRoute(start, end)
          : await RouteService.getSafeRoute(start, end, 0.9);

        processRouteResponse(data, isFastRoute);
        setIsSafeRoute(!isFastRoute);
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
    if (!startPoint || !endPoint || loading) return;

    setLoading(true);
    setColoredSegments([]);

    try {
      if (isSafeRoute) {
        const data = await RouteService.getOpenRouteServiceRoute(
          startPoint,
          endPoint
        );
        processRouteResponse(data, true);
        setIsSafeRoute(false);
      } else {
        const data = await RouteService.getSafeRoute(startPoint, endPoint, 0.9);
        processRouteResponse(data, false);
        setIsSafeRoute(true);
      }
    } catch (error) {
      resetRoute();

      if (error instanceof Error && error.message === "ROUTE_IMPOSSIBLE") {
        Alert.alert(
          "Unreachable route",
          "Sorry, no walking route was found for this destination. Please choose a closer or more accessible destination.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Unable to calculate route. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    startPoint,
    endPoint,
    isSafeRoute,
    loading,
    processRouteResponse,
    resetRoute,
  ]);

  const setDestination = useCallback(
    async (destination: Coordinate) => {
      if (!startPoint) return;

      setEndPoint(destination);
      setLoading(true);

      try {
        // If it's the first click (no existing route), force safe route
        const shouldUseSafeRoute = route.length === 0 ? true : isSafeRoute;

        const data = shouldUseSafeRoute
          ? await RouteService.getSafeRoute(startPoint, destination, 0.9)
          : await RouteService.getOpenRouteServiceRoute(
              startPoint,
              destination
            );

        setColoredSegments([]);
        processRouteResponse(data, !shouldUseSafeRoute);
        setIsSafeRoute(shouldUseSafeRoute);
      } catch (error) {
        // Completely reset state in case of error
        resetRoute();

        // Display appropriate error message
        if (error instanceof Error && error.message === "ROUTE_IMPOSSIBLE") {
          Alert.alert(
            "Unreachable route",
            "Sorry, no walking route was found for this destination. Please choose a closer or more accessible destination.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert("Error", "Unable to calculate route. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [startPoint, isSafeRoute, route.length, processRouteResponse, resetRoute]
  );

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
    isSafeRoute,
    setStartPoint,
    setDestination,
    calculateRoute,
    findSaferRoute,
    resetRoute,
  };
}

export default useRoute;
