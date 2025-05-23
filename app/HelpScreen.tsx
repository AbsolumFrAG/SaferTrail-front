import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useRouter } from "expo-router";
import { JSX, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const audioSource = require("../assets/sounds/siren.mp3");

export default function HelpScreen(): JSX.Element {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [skipConfirm, setSkipConfirm] = useState<boolean>(false);

  // Utilisation du hook useAudioPlayer
  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);

  const sirenActive = status.playing;

  const startSiren = (): void => {
    try {
      player.play();
    } catch (err) {
      console.error("Error starting siren:", err);
    }
  };

  const stopSiren = (): void => {
    try {
      player.pause();
      player.seekTo(0); // Remettre au début pour la prochaine fois
    } catch (err) {
      console.error("Error stopping siren:", err);
    }
  };

  const handlePanicPress = (): void => {
    if (sirenActive) {
      stopSiren();
    } else {
      if (skipConfirm) {
        startSiren();
      } else {
        setShowPopup(true);
      }
    }
  };

  const handlePopupSirenPress = (): void => {
    setShowPopup(false);
    Alert.alert(
      "Important",
      "If you are wearing headphones, unplug them.\nTurn your volume to the maximum.\nThe siren will start once you close this alert.",
      [
        {
          text: "OK",
          onPress: () => {
            startSiren();
          },
        },
      ]
    );
  };

  const handleLinkPress = (): void => {
    Linking.openURL("https://data.boston.gov");
  };

  const handleCallPress = (): void => {
    Linking.openURL("tel:911");
  };

  const toggleSkipConfirm = (): void => {
    setSkipConfirm(!skipConfirm);
  };

  const closePopup = (): void => {
    setShowPopup(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.backText}>Return</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "green" }]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "orange" }]} />
            <Text style={styles.legendText}>Less safe</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "red" }]} />
            <Text style={styles.legendText}>Risky</Text>
          </View>
        </View>

        {/* Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information:</Text>
          <Text style={styles.sectionText}>
            The route is considered moderately safe. One accident was reported
            in the area within the past three months, but no other major
            incidents have been recorded recently. Street lighting is generally
            adequate. Still, remain cautious in less busy areas.
          </Text>
        </View>

        {/* Data Sources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sources:</Text>
          <Text style={styles.sectionText}>
            The information used in this app comes from the official platform{" "}
            <Text style={styles.linkText} onPress={handleLinkPress}>
              data.boston.gov
            </Text>
            .{"\n"}
            The datasets include:
          </Text>
          <Text style={styles.bullet}>
            • Streetlights (location and outage reports)
          </Text>
          <Text style={styles.bullet}>
            • Crimes (type, location, and date of incidents)
          </Text>
          <Text style={styles.bullet}>
            • Traffic accidents (severity, frequency, and affected areas)
          </Text>
          <Text style={styles.sectionText}>
            These public datasets are regularly updated and enable the
            generation of safer nighttime routes based on real-world data.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.panicButton} onPress={handlePanicPress}>
          <Text style={styles.panicText}>
            {sirenActive ? "Stop panic siren" : "Panic siren"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
          <Text style={styles.callText}>Call 911</Text>
        </TouchableOpacity>
      </View>

      {/* Popup Modal */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popup}>
            <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.popupText}>
              By pressing this button, you trigger a loud, piercing alarm
              designed to scare off anyone following you and immediately draw
              attention to your location.
            </Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={toggleSkipConfirm}
            >
              <MaterialIcons
                name={skipConfirm ? "check-box" : "check-box-outline-blank"}
                size={28}
                color={skipConfirm ? "#666" : "#999"}
              />
              <Text style={styles.checkboxText}>
                Skip confirmation and trigger the alarm immediately next time.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.popupSirenButton}
              onPress={handlePopupSirenPress}
            >
              <Text style={styles.panicText}>Panic siren</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.popupCancelButton}
              onPress={closePopup}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#414141",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#414141",
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  backText: {
    color: "#007AFF",
    fontSize: 18,
    marginLeft: 4,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 160,
  },
  legendContainer: {
    marginBottom: 30,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  sectionText: {
    fontSize: 16,
    color: "white",
    lineHeight: 22,
  },
  bullet: {
    fontSize: 16,
    color: "white",
    paddingLeft: 20,
    lineHeight: 22,
  },
  linkText: {
    color: "#87CEFA",
    textDecorationLine: "underline",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#414141",
    paddingBottom: 40,
  },
  panicButton: {
    backgroundColor: "#E53935",
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 12,
    alignItems: "center",
  },
  panicText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  callButton: {
    backgroundColor: "#FFC107",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  callText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#F1F0E8",
    borderRadius: 20,
    padding: 20,
    paddingTop: 50,
    width: "85%",
    elevation: 5,
    position: "relative",
  },
  popupText: {
    fontSize: 16,
    color: "#222",
    marginBottom: 20,
    lineHeight: 22,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
  popupSirenButton: {
    backgroundColor: "#E53935",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  popupCancelButton: {
    backgroundColor: "#333",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  cancelText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
