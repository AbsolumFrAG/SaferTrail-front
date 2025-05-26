import { useCallback, useMemo, useState } from "react";
import { Region } from "react-native-maps";
import { DEFAULT_REGION } from "../constants";
import { Coordinate } from "../types";

export function useMapRegion() {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);

  const updateRegion = useCallback((newRegion: Partial<Region>) => {
    setRegion((prev) => ({ ...prev, ...newRegion }));
  }, []);

  const centerOnLocation = useCallback((location: Coordinate) => {
    setRegion((prev) => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  }, []);

  const centerOnRoute = useCallback((coordinates: Coordinate[]) => {
    if (coordinates.length === 0) return;

    const latitudes = coordinates.map((coord) => coord.latitude);
    const longitudes = coordinates.map((coord) => coord.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.1; // Add 10% padding
    const deltaLng = (maxLng - minLng) * 1.1;

    setRegion({
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    });
  }, []);

  const regionStyle = useMemo(
    () => ({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    }),
    [region]
  );

  return {
    region: regionStyle,
    updateRegion,
    centerOnLocation,
    centerOnRoute,
  };
}
