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
import { CUISINE_OPTIONS, PRICE_TIERS } from "@/constants/cuisines";
import { useI18n } from "@/hooks/useI18n";

const CARD_WIDTH = 160;

// Warm, editorial tones per cuisine family
const CUISINE_BG: Record<string, string> = {
  arabic:        "#C4702A",
  emirati:       "#8B5E3C",
  lebanese:      "#C26B3A",
  turkish:       "#9B4A1E",
  persian:       "#A04E2A",
  mediterranean: "#4A8C72",
  indian:        "#C8831A",
  pakistani:     "#B87A20",
  thai:          "#C49220",
  japanese:      "#4A7A8C",
  korean:        "#5C6E8A",
  chinese:       "#B83A2A",
  italian:       "#C03A20",
  american:      "#5C3D2E",
  seafood:       "#2E7DA8",
  cafe:          "#8C5A42",
  brunch:        "#9C6448",
  french:        "#7A5C7A",
  desserts:      "#9C4A7A",
  mexican:       "#B85A20",
};

const DEFAULT_BG = "#7A6B5A";

function cuisineBg(tags: string[]): string {
  for (const tag of tags) {
    if (CUISINE_BG[tag]) return CUISINE_BG[tag];
  }
  return DEFAULT_BG;
}

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

  const cuisineOption = CUISINE_OPTIONS.find((c) => place.cuisine_tags.includes(c.tag));
  const cuisineEmoji = cuisineOption?.emoji ?? "🍽️";

  const priceTier = PRICE_TIERS.find((p) => p.value === place.price_tier);
  const priceLabel = priceTier ? (locale === "ar" ? priceTier.label_ar : priceTier.label_en) : null;

  const bgColor = cuisineBg(place.cuisine_tags);
  const photoUrl = null; // Future: place.cover_url

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

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.88}
    >
      {/* Cover image / cuisine-colored fallback */}
      <View style={[styles.photoWrap, { backgroundColor: bgColor }]}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <>
            {/* Subtle dark overlay at bottom for text legibility */}
            <View style={styles.photoOverlay} />
            <Text style={styles.fallbackEmoji}>{cuisineEmoji}</Text>
          </>
        )}

        {/* Rating badge — bottom left */}
        {place.avg_rating !== null && place.avg_rating > 0 && (
          <View style={[styles.ratingBadge, isRTL && styles.ratingBadgeRTL]}>
            <Text style={styles.ratingText}>★ {place.avg_rating.toFixed(1)}</Text>
          </View>
        )}

        {/* Save button — top right */}
        <TouchableOpacity
          style={[styles.saveBtn, isRTL && styles.saveBtnRTL]}
          onPress={handleSave}
          hitSlop={8}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={15}
            color={isSaved ? Colors.accentGold : "rgba(255,255,255,0.9)"}
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

        {/* Price + review count row */}
        <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
          {priceLabel && (
            <Text size="xs" style={styles.price}>{priceLabel}</Text>
          )}
          {place.review_count > 0 && (
            <Text size="xs" style={styles.reviewCount}>
              {place.review_count} {place.review_count === 1 ? "review" : "reviews"}
            </Text>
          )}
        </View>
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
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  fallbackEmoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  ratingBadge: {
    position: "absolute",
    bottom: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: Radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ratingBadgeRTL: { left: undefined, right: Spacing.xs },
  ratingText: {
    color: "#FFD770",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Typography.fontSans,
  },
  saveBtn: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    width: 28,
    height: 28,
    borderRadius: Radii.sm,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnRTL: { right: undefined, left: Spacing.xs },
  body: {
    padding: Spacing.sm,
    gap: 4,
  },
  name: {
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  textRTL: { textAlign: "right" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flexWrap: "wrap",
  },
  metaRowRTL: { flexDirection: "row-reverse" },
  price: {
    color: Colors.accentGold,
    fontWeight: "600",
    fontSize: 11,
  },
  reviewCount: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});
