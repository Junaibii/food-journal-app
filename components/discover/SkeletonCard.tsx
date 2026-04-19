/**
 * Animated placeholder card shown while Discover data is loading.
 * Matches the dimensions of PlaceCard so the layout doesn't jump.
 */
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Colors, Radii, Spacing } from "@/constants/theme";

const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;

export function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.photo} />
      <View style={styles.body}>
        <View style={styles.titleLine} />
        <View style={styles.subtitleLine} />
      </View>
    </Animated.View>
  );
}

export function SkeletonRow() {
  return (
    <View style={styles.row}>
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgElevated,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: 110,
    backgroundColor: Colors.creamDeep,
  },
  body: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  titleLine: {
    height: 12,
    borderRadius: 4,
    backgroundColor: Colors.creamDeep,
    width: "80%",
  },
  subtitleLine: {
    height: 10,
    borderRadius: 4,
    backgroundColor: Colors.creamDeep,
    width: "55%",
  },
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
});
