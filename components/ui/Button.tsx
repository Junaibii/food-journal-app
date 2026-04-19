import React from "react";
import {
  TouchableOpacity,
  type TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { Text } from "./Text";

interface Props extends TouchableOpacityProps {
  label: string;
  variant?: "accent" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  label,
  variant = "accent",
  size = "md",
  loading = false,
  icon,
  style,
  disabled,
  ...props
}: Props) {
  const height = { sm: 36, md: 44, lg: 52 }[size];
  const fontSize: keyof typeof Typography.sizes = { sm: "sm", md: "base", lg: "md" }[size] as any;

  const bg =
    variant === "accent"
      ? Colors.accent
      : variant === "destructive"
        ? Colors.error
        : "transparent";

  const textColor =
    variant === "accent"
      ? Colors.textInverse
      : variant === "destructive"
        ? Colors.textPrimary
        : variant === "outline"
          ? Colors.textPrimary
          : Colors.textSecondary;

  const borderColor = variant === "outline" ? Colors.border : "transparent";

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { height, backgroundColor: bg, borderColor },
        disabled || loading ? styles.disabled : null,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.75}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon}
          <Text
            size={fontSize}
            weight="semibold"
            color={textColor}
            style={icon ? { marginStart: Spacing.xs } : undefined}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.base,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.4,
  },
});
