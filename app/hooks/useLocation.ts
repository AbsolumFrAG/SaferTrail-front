import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { LocationService } from "../services/location";
import { Coordinate } from "../types";

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      const result = await LocationService.requestLocationPermission();
      setPermissionGranted(result.granted);

      if (result.granted && result.location) {
        setCurrentLocation(result.location);
      } else {
        Alert.alert(
          "Permission denied",
          "Location permission is required to use this app"
        );
      }
    } catch (error) {
      console.error("Location permission error:", error);
      Alert.alert("Error", "Failed to get location permission");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLocation = useCallback(async () => {
    if (!permissionGranted) return;

    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error("Refresh location error:", error);
    }
  }, [permissionGranted]);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    currentLocation,
    loading,
    permissionGranted,
    requestPermission,
    refreshLocation,
  };
}
