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
}

const handleCallPress = (): void => {
  Linking.openURL("tel:911");
};

const EmergencyButtons = memo<EmergencyButtonsProps>(
  ({ onPanicPress, sirenActive }) => (
    <View style={styles.container}>
      <TouchableOpacity style={styles.panicButton} onPress={onPanicPress}>
        <Text style={styles.panicText}>
          {sirenActive ? "Stop panic siren" : "Panic siren"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
        <Text style={styles.callText}>Call 911</Text>
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
});

export default EmergencyButtons;