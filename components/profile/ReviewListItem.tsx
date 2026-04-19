import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Review } from "@/types";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { RatingStars } from "@/components/ui/RatingStars";
import { CUISINE_OPTIONS } from "@/constants/cuisines";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  review: Review;
  placeName?: string;
  placeEmoji?: string;
}

export function ReviewListItem({ review, placeName, placeEmoji = "🍽️" }: Props) {
  const router = useRouter();
  const { isRTL } = useI18n();

  return (
    <TouchableOpacity
      style={[styles.row, isRTL && styles.rowRTL]}
      onPress={() => router.push(`/place/${review.place_id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{placeEmoji}</Text>
      </View>

      <View style={styles.info}>
        {placeName ? (
          <Text size="sm" weight="semibold" numberOfLines={1}>{placeName}</Text>
        ) : (
          <Text size="sm" muted numberOfLines={1}>{review.place_id}</Text>
        )}
        <View style={[styles.meta, isRTL && styles.metaRTL]}>
          {review.rating ? <RatingStars rating={review.rating} size="sm" /> : null}
          {review.visit_date ? (
            <Text size="xs" muted>{review.visit_date}</Text>
          ) : null}
        </View>
        {review.body ? (
          <Text size="xs" secondary numberOfLines={2} style={styles.body}>
            {review.body}
          </Text>
        ) : null}
      </View>

      <Ionicons
        name={isRTL ? "chevron-back" : "chevron-forward"}
        size={16}
        color={Colors.textMuted}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  rowRTL: { flexDirection: "row-reverse" },
  emojiWrap: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: { fontSize: 22 },
  info: { flex: 1, gap: 3 },
  meta: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  metaRTL: { flexDirection: "row-reverse" },
  body: { lineHeight: 18 },
  chevron: { flexShrink: 0 },
});
