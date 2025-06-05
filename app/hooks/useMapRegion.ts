import { useCallback, useMemo, useState } from "react";
import { Region } from "react-native-maps";
import { DEFAULT_REGION } from "../constants";
import { Coordinate } from "../../types";

function useMapRegion() {
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
  };
}

export default useMapRegion;
