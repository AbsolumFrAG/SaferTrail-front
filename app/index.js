import React from "react";
import { StyleSheet, View } from "react-native";
import MapRouteComponent from "./components/MapRouteComponent";

export default function index() {
  return (
    <View style={styles.container}>
      <MapRouteComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
