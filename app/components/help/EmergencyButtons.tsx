import { memo } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EmergencyButtonsProps {
  onPanicPress: () => void;
  sirenActive: boolean;
  disabled?: boolean;
}

const handleCallPress = (): void => {
  Linking.openURL("tel:911");
};

const EmergencyButtons = memo<EmergencyButtonsProps>(
  ({ onPanicPress, sirenActive, disabled = false }) => (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.panicButton, disabled && styles.buttonDisabled]}
        onPress={onPanicPress}
        disabled={disabled}
      >
        <Text style={[styles.panicText, disabled && styles.textDisabled]}>
          {sirenActive ? "Stop panic siren" : "Panic siren"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.callButton, disabled && styles.buttonDisabled]}
        onPress={handleCallPress}
        disabled={disabled}
      >
        <Text style={[styles.callText, disabled && styles.textDisabled]}>
          Call 911
        </Text>
      </TouchableOpacity>
    </View>
  )
);

EmergencyButtons.displayName = "EmergencyButtons";

const styles = StyleSheet.create({
  container: {
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
  buttonDisabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.7,
  },
});

export default EmergencyButtons;
