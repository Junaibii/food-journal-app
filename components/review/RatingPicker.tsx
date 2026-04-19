import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  value: number | null;
  onChange: (rating: number) => void;
}

const LABELS: Record<number, { en: string; ar: string }> = {
  1: { en: "Poor", ar: "سيء" },
  2: { en: "Fair", ar: "مقبول" },
  3: { en: "Good", ar: "جيد" },
  4: { en: "Very Good", ar: "جيد جداً" },
  5: { en: "Excellent", ar: "ممتاز" },
};

export function RatingPicker({ value, onChange }: Props) {
  const { locale } = useI18n();

  const handlePress = (star: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(star);
  };

  const label = value !== null
    ? (locale === "ar" ? LABELS[value]?.ar : LABELS[value]?.en)
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = value !== null && star <= value;
          return (
            <TouchableOpacity
              key={star}
              onPress={() => handlePress(star)}
              activeOpacity={0.7}
              style={styles.starBtn}
            >
              <Text style={[styles.star, { color: filled ? Colors.accentGold : Colors.creamDeep }]}>
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {label ? (
        <Text size="sm" secondary style={styles.label}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: Spacing.xs },
  stars: { flexDirection: "row", gap: Spacing.xs },
  starBtn: { padding: Spacing.xs },
  star: { fontSize: 40 },
  label: { marginTop: Spacing.xs },
});
