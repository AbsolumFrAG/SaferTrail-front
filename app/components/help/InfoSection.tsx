import { memo } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants";

const handleLinkPress = (): void => {
  Linking.openURL("https://data.boston.gov");
};

export const InfoSection = memo(() => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Information:</Text>
      <Text style={styles.sectionText}>
        The route is considered moderately safe. One accident was reported in
        the area within the past three months, but no other major incidents have
        been recorded recently. Street lighting is generally adequate. Still,
        remain cautious in less busy areas.
      </Text>
    </View>

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
        These public datasets are regularly updated and enable the generation of
        safer nighttime routes based on real-world data.
      </Text>
    </View>
  </>
));

InfoSection.displayName = "InfoSection";

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  sectionText: {
    fontSize: 16,
    color: COLORS.WHITE,
    lineHeight: 22,
  },
  bullet: {
    fontSize: 16,
    color: COLORS.WHITE,
    paddingLeft: 20,
    lineHeight: 22,
  },
  linkText: {
    color: "#87CEFA",
    textDecorationLine: "underline",
  },
});
