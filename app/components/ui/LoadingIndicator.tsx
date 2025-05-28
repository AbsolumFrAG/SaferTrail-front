import { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants";

interface LoadingIndicatorProps {
  message: string;
  size?: "small" | "large";
  overlay?: boolean;
}

const LoadingIndicator = memo<LoadingIndicatorProps>(
  ({ message, size = "large", overlay = false }) => {
    const containerStyle = overlay
      ? [styles.container, styles.overlay]
      : styles.container;

    return (
      <View style={containerStyle}>
        <ActivityIndicator size={size} color={COLORS.LOW_RISK} />
        <Text style={styles.text}>{message}</Text>
      </View>
    );
  }
);

LoadingIndicator.displayName = "LoadingIndicator";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
  },
  overlay: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: "row",
    zIndex: 1000,
  },
  text: {
    color: COLORS.WHITE,
    marginTop: 10,
    fontSize: 16,
    marginLeft: 8,
  },
});

export default LoadingIndicator;