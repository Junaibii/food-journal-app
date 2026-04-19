import React from "react";
import { Text as RNText, type TextProps, StyleSheet } from "react-native";
import { Colors, Typography } from "@/constants/theme";
import { useI18n } from "@/hooks/useI18n";

interface Props extends TextProps {
  size?: keyof typeof Typography.sizes;
  weight?: keyof typeof Typography.weights;
  color?: string;
  secondary?: boolean;
  muted?: boolean;
}

export function Text({
  style,
  size = "base",
  weight = "regular",
  color,
  secondary,
  muted,
  ...props
}: Props) {
  const { isRTL } = useI18n();

  return (
    <RNText
      style={[
        {
          fontSize: Typography.sizes[size],
          fontWeight: Typography.weights[weight],
          color: muted
            ? Colors.textMuted
            : secondary
              ? Colors.textSecondary
              : color ?? Colors.textPrimary,
          textAlign: isRTL ? "right" : "left",
          writingDirection: isRTL ? "rtl" : "ltr",
        },
        style,
      ]}
      {...props}
    />
  );
}
