import { useRouter } from "expo-router";
import { FC, useCallback, useEffect, useMemo } from "react";
import { Alert, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import MapView, { MapPressEvent } from "react-native-maps";

import useLocation from "../hooks/useLocation";
import useMapRegion from "../hooks/useMapRegion";
import useRoute from "../hooks/useRoute";
import useStreetSegments from "../hooks/useStreetSegments";

import ErrorBoundary from "./ErrorBoundary";
import MapMarkers from "./map/MapMarkers";
import MapPolylines from "./map/MapPolylines";
import InstructionMessage from "./ui/InstructionMessage";
import LoadingIndicator from "./ui/LoadingIndicator";
import RouteInfo from "./ui/RouteInfo";

import { COLORS } from "../constants";

const MapRouteComponentInner: FC = () => {
  const router = useRouter();

  // Custom hooks
  const {
    currentLocation,
    loading: locationLoading,
    permissionGranted,
  } = useLocation();

  const { segments: streetSegments, loading: segmentsLoading } =
    useStreetSegments();

  const {
    startPoint,
    endPoint,
    coloredSegments,
    routeInfo,
    loading: routeLoading,
    setStartPoint,
    setDestination,
    findSaferRoute,
    isSafeRoute,
  } = useRoute();

  const { region, centerOnLocation } = useMapRegion();

  // Set start point when current location is available
  useEffect(() => {
    if (currentLocation && !startPoint) {
      setStartPoint(currentLocation);
      centerOnLocation(currentLocation);
    }
  }, [currentLocation, startPoint, setStartPoint, centerOnLocation]);

  // Handle map press
  const handleMapPress = useCallback(
    async (event: MapPressEvent) => {
      if (!permissionGranted || !currentLocation) {
        Alert.alert(
          "Location Required",
          "Please enable location permissions to set a destination"
        );
        return;
      }

      const coordinate = event.nativeEvent.coordinate;
      await setDestination(coordinate);
    },
    [permissionGranted, currentLocation, setDestination]
  );

  // Handle safer route search
  const handleFindSaferRoute = useCallback(() => {
    if (routeLoading) return;
    findSaferRoute();
  }, [routeLoading, findSaferRoute]);

  // Handle help navigation
  const handleShowHelp = useCallback(() => {
    router.push("/HelpScreen");
  }, [router]);

  // Memoized instruction message
  const instructionMessage = useMemo(() => {
    if (!permissionGranted) {
      return "Location permission required...";
    }
    if (locationLoading) {
      return "Getting your location...";
    }
    if (!endPoint && currentLocation) {
      return "Touch the map to set your destination";
    }
    return "";
  }, [permissionGranted, locationLoading, endPoint, currentLocation]);

  // Render loading overlay for segments
  const renderSegmentsLoading = useMemo(() => {
    if (!segmentsLoading) return null;

    return (
      <LoadingIndicator message="Loading safety data..." size="small" overlay />
    );
  }, [segmentsLoading]);

  // Render route loading
  const renderRouteLoading = useMemo(() => {
    if (!routeLoading) return null;

    return <LoadingIndicator message="Calculating route..." />;
  }, [routeLoading]);

  // Render route info
  const renderRouteInfo = useMemo(() => {
    if (!routeInfo) return null;

    return (
      <RouteInfo
        routeInfo={routeInfo}
        onFindSaferRoute={handleFindSaferRoute}
        onShowHelp={handleShowHelp}
        loading={routeLoading}
        isSafeRoute={isSafeRoute}
      />
    );
  }, [
    routeInfo,
    handleFindSaferRoute,
    handleShowHelp,
    routeLoading,
    isSafeRoute,
  ]);

  // Render instruction message
  const renderInstruction = useMemo(() => {
    if (!instructionMessage) return null;

    return <InstructionMessage message={instructionMessage} />;
  }, [instructionMessage]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={permissionGranted}
        showsMyLocationButton={permissionGranted}
        followsUserLocation={false}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
      >
        <MapPolylines
          streetSegments={streetSegments}
          coloredSegments={coloredSegments}
        />

        <MapMarkers startPoint={startPoint} endPoint={endPoint} />
      </MapView>

      {renderSegmentsLoading}

      <View style={styles.bottomContainer}>
        {renderRouteLoading}
        {renderRouteInfo}
        {renderInstruction}
        <TouchableOpacity style={styles.infoButton} onPress={handleShowHelp}>
          <Text style={styles.infoButtonText}>Info and Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main component with error boundary
const MapRouteComponent: FC = () => (
  <ErrorBoundary>
    <MapRouteComponentInner />
  </ErrorBoundary>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
  },
  map: {
    flex: 1,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  infoButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  infoButtonText: {
    color: COLORS.BLACK,
    fontSize: 16,
  },
});

export default MapRouteComponent;
