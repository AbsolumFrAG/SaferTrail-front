import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const MapRouteComponent = () => {
  const [region, setRegion] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [route, setRoute] = useState([]);
  const [coloredSegments, setColoredSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [travelTime, setTravelTime] = useState(null);
  const [safetyPercentage, setSafetyPercentage] = useState(null);
  const router = useRouter();

  // Fonction pour mettre à jour la position actuelle
  const updateCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const newPosition = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setStartPoint(newPosition);

      // Recalculer l'itinéraire si une destination est définie
      if (endPoint) {
        getRoute(newPosition, endPoint);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la position:", error);
    }
  };

  // Demander la permission de localisation et définir le point de départ
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Permission de localisation refusée");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentPosition = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setRegion({
        ...region,
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
      });

      // Définir automatiquement la position actuelle comme point de départ
      setStartPoint(currentPosition);
    })();
  }, []);

  // Fonction pour obtenir l'itinéraire depuis OSRM
  const getRoute = async (start, end) => {
    setLoading(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(
          (coord) => ({
            latitude: coord[1],
            longitude: coord[0],
          })
        );

        setRoute(coordinates);
        setTravelTime(Math.round(data.routes[0].duration / 60)); // en minutes

        // Créer des segments colorés (simulation des zones dangereuses)
        createColoredSegments(coordinates);
      } else {
        Alert.alert("Erreur", "Impossible de calculer l'itinéraire");
      }
    } catch (error) {
      console.error("Erreur lors du calcul de l'itinéraire:", error);
      Alert.alert("Erreur", "Erreur de réseau");
    } finally {
      setLoading(false);
    }
  };

  // Créer des segments colorés (simulation)
  const createColoredSegments = (coordinates) => {
    const segments = [];
    const segmentSize = Math.max(1, Math.floor(coordinates.length / 10));

    for (let i = 0; i < coordinates.length - 1; i += segmentSize) {
      const endIndex = Math.min(i + segmentSize, coordinates.length - 1);
      const segment = coordinates.slice(i, endIndex + 1);

      // Simulation: certains segments sont "dangereux" (orange/rouge)
      const isDangerous = Math.random() > 0.7;
      const color = isDangerous ? "#FF6B35" : "#4CAF50";

      segments.push({
        coordinates: segment,
        color: color,
        isDangerous: isDangerous,
      });
    }

    setColoredSegments(segments);

    // Calculer le pourcentage de sécurité
    const safeSegments = segments.filter((s) => !s.isDangerous).length;
    const percentage = Math.round((safeSegments / segments.length) * 100);
    setSafetyPercentage(percentage);
  };

  // Gérer le clic sur la carte
  const handleMapPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;

    // Le point de départ est toujours la position actuelle
    // Un clic définit/redéfinit seulement le point d'arrivée
    setEndPoint(coordinate);

    // S'il y a un point de départ (position actuelle), calculer l'itinéraire
    if (startPoint) {
      getRoute(startPoint, coordinate);
    }

    // Reset les données précédentes s'il y en avait
    setRoute([]);
    setColoredSegments([]);
    setTravelTime(null);
    setSafetyPercentage(null);
  };

  // Fonction pour trouver un itinéraire plus sûr (simulation)
  const findSaferRoute = () => {
    if (route.length === 0) return;

    // Simulation d'un itinéraire plus sûr
    const saferSegments = coloredSegments.map((segment) => ({
      ...segment,
      color: Math.random() > 0.3 ? "#4CAF50" : "#FFA726",
      isDangerous: Math.random() > 0.8,
    }));

    setColoredSegments(saferSegments);

    const safeSegments = saferSegments.filter((s) => !s.isDangerous).length;
    const percentage = Math.round((safeSegments / saferSegments.length) * 100);
    setSafetyPercentage(percentage);
    setTravelTime(travelTime + Math.floor(Math.random() * 5) + 2); // Ajouter quelques minutes
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Marqueur de départ (position actuelle) */}
        {startPoint && (
          <Marker
            coordinate={startPoint}
            title="Ma position"
            description="Point de départ"
          >
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        )}

        {/* Marqueur d'arrivée */}
        {endPoint && <Marker coordinate={endPoint} pinColor="red" />}

        {/* Segments colorés de l'itinéraire */}
        {coloredSegments.map((segment, index) => (
          <Polyline
            key={index}
            coordinates={segment.coordinates}
            strokeColor={segment.color}
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        ))}
      </MapView>

      {/* Interface utilisateur en bas */}
      <View style={styles.bottomContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Calcul de l'itinéraire...</Text>
          </View>
        )}

        {travelTime && safetyPercentage !== null && (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.timeText}>{travelTime} min</Text>
              <View style={styles.safetyContainer}>
                <View style={styles.safetyDot} />
                <Text style={styles.safetyText}>{safetyPercentage}% safe</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saferWayButton}
              onPress={findSaferRoute}
            >
              <Text style={styles.saferWayText}>Safer way</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => router.push("/helpScreen")}
            >
              <Text style={styles.infoButtonText}>Info and help</Text>
            </TouchableOpacity>
          </View>
        )}

        {!endPoint && startPoint && (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Touchez la carte pour définir votre destination
            </Text>
          </View>
        )}

        {!startPoint && (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Localisation en cours...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 0, // Assure qu'il n'y a pas de padding top
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  infoContainer: {
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  timeText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  safetyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  safetyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  safetyText: {
    color: "white",
    fontSize: 18,
  },
  saferWayButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  saferWayText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  infoButtonText: {
    color: "black",
    fontSize: 16,
  },
  instructionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
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

export default MapRouteComponent;
