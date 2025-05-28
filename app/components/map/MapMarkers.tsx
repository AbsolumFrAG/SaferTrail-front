import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { Coordinate } from "../../../types";

interface MapMarkersProps {
  startPoint: Coordinate | null;
  endPoint: Coordinate | null;
}

const CurrentLocationMarker = memo(() => (
  <View style={styles.currentLocationMarker}>
    <View style={styles.currentLocationDot} />
  </View>
));

CurrentLocationMarker.displayName = "CurrentLocationMarker";

const MapMarkers = memo<MapMarkersProps>(({ startPoint, endPoint }) => (
  <>
    {startPoint && (
      <Marker
        coordinate={startPoint}
        title="My Location"
        description="Starting point"
        zIndex={3}
      >
        <CurrentLocationMarker />
      </Marker>
    )}

    {endPoint && <Marker coordinate={endPoint} pinColor="red" zIndex={3} />}
  </>
));

MapMarkers.displayName = "MapMarkers";

const styles = StyleSheet.create({
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(74, 175, 255, 0.3)",
    borderWidth: 2,
    borderColor: "#4AAFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4AAFFF",
  },
});

export default MapMarkers;