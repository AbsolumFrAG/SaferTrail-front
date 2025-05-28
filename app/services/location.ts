import * as Location from "expo-location";
import { Coordinate, LocationPermissionResult } from "../../types";

export default class LocationService {
  static async requestLocationPermission(): Promise<LocationPermissionResult> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return { granted: false, location: null };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        granted: true,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };
    } catch (error) {
      console.error("Location permission error:", error);
      return { granted: false, location: null };
    }
  }

  static async getCurrentLocation(): Promise<Coordinate | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Get current location error:", error);
      return null;
    }
  }
}
