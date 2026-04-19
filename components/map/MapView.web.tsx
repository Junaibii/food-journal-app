import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";

export default function MapView() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map available on mobile app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
