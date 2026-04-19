import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { SaveRecord } from "@/services/saves";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { CUISINE_OPTIONS } from "@/constants/cuisines";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  save: SaveRecord;
}

export function SaveListItem({ save }: Props) {
  const router = useRouter();
  const { locale, isRTL } = useI18n();

  const place = save.place;
  const placeName = place
    ? (locale === "ar" && place.name_ar ? place.name_ar : place.name_en)
    : save.place_id;
  const emoji = place
    ? (CUISINE_OPTIONS.find((c) => place.cuisine_tags.includes(c.tag))?.emoji ?? "🍽️")
    : "🍽️";
  const neighborhood = place?.neighborhood ?? null;

  return (
    <TouchableOpacity
      style={[styles.row, isRTL && styles.rowRTL]}
      onPress={() => router.push(`/place/${save.place_id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text size="sm" weight="semibold" numberOfLines={1}>{placeName}</Text>
        {neighborhood ? (
          <Text size="xs" muted>{neighborhood}</Text>
        ) : null}
        {save.visited && (
          <View style={[styles.visitedBadge, isRTL && styles.badgeRTL]}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
            <Text size="xs" style={styles.visitedText}>Visited</Text>
          </View>
        )}
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
  visitedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  badgeRTL: { flexDirection: "row-reverse" },
  visitedText: { color: Colors.success },
  chevron: { flexShrink: 0 },
});
