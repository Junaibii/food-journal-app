import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { Text } from "./Text";

interface Props {
  label: string;
  variant?: "default" | "accent" | "muted";
}

export function Badge({ label, variant = "default" }: Props) {
  const bg =
    variant === "accent"
      ? Colors.accentGoldBg
      : variant === "muted"
        ? Colors.bgElevated
        : Colors.bgElevated;
  const color =
    variant === "accent" ? Colors.accentGold : Colors.textSecondary;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text size="xs" weight="medium" color={color} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  label: {
    letterSpacing: 0.3,
  },
});
