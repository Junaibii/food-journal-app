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
  serif?: boolean;
  italic?: boolean;
}

export function Text({
  style,
  size = "base",
  weight = "regular",
  color,
  secondary,
  muted,
  serif,
  italic,
  ...props
}: Props) {
  const { isRTL } = useI18n();

  const fontFamily = serif
    ? italic
      ? Typography.fontDisplayItalic
      : Typography.fontDisplay
    : Typography.fontSans;

  return (
    <RNText
      style={[
        {
          fontSize: Typography.sizes[size],
          fontFamily,
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
