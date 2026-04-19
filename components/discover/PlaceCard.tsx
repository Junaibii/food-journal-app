/**
 * Compact place card used in both neighbourhood rows and collection grids.
 *
 * Shows: cover photo (or emoji fallback), name in active locale, cuisine
 * badge, price tier dots, and a save/unsave toggle button.
 */
import React, { useCallback } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Place } from "@/types";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { CUISINE_OPTIONS } from "@/constants/cuisines";
import { useI18n } from "@/hooks/useI18n";

const CARD_WIDTH = 160;
const PRICE_TIER_SYMBOLS = ["·", "·", "·", "·"];

interface Props {
  place: Place;
  isSaved?: boolean;
  onSaveToggle?: (place: Place) => void;
  style?: StyleProp<ViewStyle>;
}

export function PlaceCard({ place, isSaved = false, onSaveToggle, style }: Props) {
  const router = useRouter();
  const { locale, isRTL } = useI18n();

  const name = locale === "ar" && place.name_ar ? place.name_ar : place.name_en;

  const cuisineOption = CUISINE_OPTIONS.find((c) =>
    place.cuisine_tags.includes(c.tag),
  );
  const cuisineLabel =
    locale === "ar" && cuisineOption?.label_ar
      ? cuisineOption.label_ar
      : cuisineOption?.label_en ?? "";
  const cuisineEmoji = cuisineOption?.emoji ?? "🍽️";

  const handlePress = useCallback(() => {
    router.push(`/place/${place.id}`);
  }, [router, place.id]);

  const handleSave = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSaveToggle?.(place);
    },
    [onSaveToggle, place],
  );

  const photoUrl = null; // Future: place.cover_url when the API adds it

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.88}
    >
      {/* Cover image / emoji fallback */}
      <View style={styles.photoWrap}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <View style={styles.photoFallback}>
            <Text style={styles.fallbackEmoji}>{cuisineEmoji}</Text>
          </View>
        )}

        {/* Save button — overlaid top-right */}
        <TouchableOpacity
          style={[styles.saveBtn, isRTL && styles.saveBtnRTL]}
          onPress={handleSave}
          hitSlop={8}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={16}
            color={isSaved ? Colors.accentGold : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Text content */}
      <View style={styles.body}>
        <Text
          size="sm"
          weight="semibold"
          numberOfLines={2}
          style={[styles.name, isRTL && styles.textRTL]}
        >
          {name}
        </Text>

        {/* Cuisine badge */}
        {cuisineLabel ? (
          <View style={[styles.badge, isRTL && styles.badgeRTL]}>
            <Text size="xs" style={styles.badgeText} numberOfLines={1}>
              {cuisineLabel}
            </Text>
          </View>
        ) : null}

        {/* Price tier dots */}
        {place.price_tier ? (
          <View style={[styles.priceRow, isRTL && styles.priceRowRTL]}>
            {PRICE_TIER_SYMBOLS.map((dot, idx) => (
              <Text
                key={idx}
                size="xs"
                style={
                  idx < place.price_tier!
                    ? styles.priceDotActive
                    : styles.priceDotInactive
                }
              >
                {dot}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  photoWrap: {
    width: "100%",
    height: 110,
    backgroundColor: Colors.bgElevated,
    position: "relative",
  },
  photoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackEmoji: {
    fontSize: 36,
  },
  saveBtn: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    width: 28,
    height: 28,
    borderRadius: Radii.sm,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnRTL: {
    right: undefined,
    left: Spacing.xs,
  },
  body: {
    padding: Spacing.sm,
    gap: 4,
  },
  name: {
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  textRTL: { textAlign: "right" },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  badgeRTL: { alignSelf: "flex-end" },
  badgeText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.xs,
  },
  priceRow: {
    flexDirection: "row",
    gap: 1,
  },
  priceRowRTL: { flexDirection: "row-reverse" },
  priceDotActive: { color: Colors.accentGold, fontSize: 13, fontWeight: "700" },
  priceDotInactive: { color: Colors.creamDeep, fontSize: 13, fontWeight: "700" },
});
