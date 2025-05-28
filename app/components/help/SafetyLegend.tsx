import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants";

interface LegendItemProps {
  color: string;
  label: string;
}

const LegendItem = memo<LegendItemProps>(({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
));

LegendItem.displayName = "LegendItem";

const SafetyLegend = memo(() => (
  <View style={styles.container}>
    <LegendItem color={COLORS.LOW_RISK} label="Safe" />
    <LegendItem color={COLORS.MEDIUM_RISK} label="Less safe" />
    <LegendItem color={COLORS.HIGH_RISK} label="Risky" />
  </View>
));

SafetyLegend.displayName = "SafetyLegend";

const styles = StyleSheet.create({
  container: {
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
    color: COLORS.WHITE,
  },
});

export default SafetyLegend;