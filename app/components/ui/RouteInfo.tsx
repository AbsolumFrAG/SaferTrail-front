import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants";
import { RouteInfo as RouteInfoType } from "../../types";

interface RouteInfoProps {
  routeInfo: RouteInfoType;
  onFindSaferRoute: () => void;
  onShowHelp: () => void;
  loading: boolean;
  isSafeRoute: boolean;
}

const getSafetyColor = (percentage: number): string => {
  if (percentage >= 80) return COLORS.LOW_RISK;
  if (percentage >= 50) return COLORS.MEDIUM_RISK;
  return COLORS.HIGH_RISK;
};

export const RouteInfo = memo<RouteInfoProps>(
  ({ routeInfo, onFindSaferRoute, onShowHelp, loading, isSafeRoute }) => {
    return (
      <View style={styles.container}>
        <View style={styles.infoRow}>
          <Text style={styles.timeText}>{routeInfo.travelTime} min</Text>
          {isSafeRoute && (
            <View style={styles.safetyContainer}>
              <View
                style={[
                  styles.safetyDot,
                  {
                    backgroundColor: getSafetyColor(routeInfo.safetyPercentage),
                  },
                ]}
              />
              <Text style={styles.safetyText}>
                {routeInfo.safetyPercentage}% safe
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.saferWayButton,
            isSafeRoute && styles.fasterWayButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={onFindSaferRoute}
          disabled={loading}
        >
          <Text
            style={[styles.saferWayText, isSafeRoute && styles.fasterWayText]}
          >
            {isSafeRoute ? "Faster way" : "Safer way"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

RouteInfo.displayName = "RouteInfo";

const styles = StyleSheet.create({
  container: {
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
    color: COLORS.WHITE,
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
    backgroundColor: COLORS.LOW_RISK,
    marginRight: 8,
  },
  safetyText: {
    color: COLORS.WHITE,
    fontSize: 18,
  },
  saferWayButton: {
    backgroundColor: COLORS.LOW_RISK,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  fasterWayButton: {
    backgroundColor: COLORS.MEDIUM_RISK,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saferWayText: {
    color: COLORS.BLACK,
    fontSize: 18,
    fontWeight: "bold",
  },
  fasterWayText: {
    color: COLORS.WHITE,
  },
});
