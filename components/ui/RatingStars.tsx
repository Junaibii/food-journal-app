import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "./Text";

interface Props {
  rating: number | null;
  size?: "sm" | "md";
  showNumber?: boolean;
}

export function RatingStars({ rating, size = "sm", showNumber = false }: Props) {
  if (rating === null) return null;
  const starSize = size === "sm" ? 12 : 16;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={{ fontSize: starSize, color: i <= rating ? Colors.accentGold : Colors.creamDeep }}
        >
          ★
        </Text>
      ))}
      {showNumber && (
        <Text size="sm" secondary style={{ marginStart: Spacing.xs }}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
});
