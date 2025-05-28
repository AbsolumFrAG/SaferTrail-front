import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { memo } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PanicModalProps {
  visible: boolean;
  skipConfirm: boolean;
  onClose: () => void;
  onToggleSkipConfirm: () => void;
  onStartSiren: () => void;
}

const PanicModal = memo<PanicModalProps>(
  ({ visible, skipConfirm, onClose, onToggleSkipConfirm, onStartSiren }) => {
    const handleSirenPress = (): void => {
      onClose();
      Alert.alert(
        "Important",
        "If you are wearing headphones, unplug them.\nTurn your volume to the maximum.\nThe siren will start once you close this alert.",
        [
          {
            text: "OK",
            onPress: onStartSiren,
          },
        ]
      );
    };

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.popupText}>
              By pressing this button, you trigger a loud, piercing alarm
              designed to scare off anyone following you and immediately draw
              attention to your location.
            </Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={onToggleSkipConfirm}
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
              style={styles.sirenButton}
              onPress={handleSirenPress}
            >
              <Text style={styles.sirenText}>Panic siren</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

PanicModal.displayName = "PanicModal";

const styles = StyleSheet.create({
  overlay: {
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
  sirenButton: {
    backgroundColor: "#E53935",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  sirenText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
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

export default PanicModal;