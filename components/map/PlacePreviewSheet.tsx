import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Place } from "@/types";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { CUISINE_OPTIONS, PRICE_TIERS } from "@/constants/cuisines";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  place: Place | null;
  onClose: () => void;
}

export function PlacePreviewSheet({ place, onClose }: Props) {
  const router = useRouter();
  const { locale, t } = useI18n();

  const openDetail = useCallback(() => {
    if (!place) return;
    router.push(`/place/${place.id}`);
  }, [place, router]);

  const name = place
    ? locale === "ar" && place.name_ar ? place.name_ar : place.name_en
    : "";
  const cuisineEmoji = place
    ? CUISINE_OPTIONS.find((c) => place.cuisine_tags.includes(c.tag))?.emoji ?? "🍽️"
    : "";
  const cuisineLabel = place
    ? CUISINE_OPTIONS.find((c) => place.cuisine_tags.includes(c.tag))?.[
        locale === "ar" ? "label_ar" : "label_en"
      ] ?? ""
    : "";
  const priceTierSymbol = place?.price_tier
    ? PRICE_TIERS.find((p) => p.value === place.price_tier)?.symbol ?? ""
    : "";

  return (
    <Modal
      visible={!!place}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop — tap outside to close */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        <View style={styles.handleBar} />

        {place && (
          <TouchableOpacity activeOpacity={0.85} onPress={openDetail}>
            {/* Place header */}
            <View style={styles.row}>
              <View style={styles.emojiBox}>
                <Text style={styles.emojiText}>{cuisineEmoji}</Text>
              </View>
              <View style={styles.info}>
                <Text size="md" weight="semibold" numberOfLines={1}>{name}</Text>
                <View style={styles.metaRow}>
                  {cuisineLabel ? (
                    <Text size="sm" secondary numberOfLines={1}>{cuisineLabel}</Text>
                  ) : null}
                  {priceTierSymbol ? (
                    <Text size="sm" secondary>  ·  {priceTierSymbol}</Text>
                  ) : null}
                </View>
                {place.neighborhood && (
                  <Text size="sm" muted numberOfLines={1}>
                    <Ionicons name="location-outline" size={11} color={Colors.textMuted} />{" "}
                    {place.neighborhood}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {place.avg_rating !== null && (
                <View style={styles.stat}>
                  <RatingStars rating={place.avg_rating} size="sm" showNumber />
                </View>
              )}
              <View style={styles.stat}>
                <Ionicons name="chatbubble-outline" size={13} color={Colors.textSecondary} />
                <Text size="sm" secondary style={{ marginStart: 4 }}>
                  {place.review_count}
                </Text>
              </View>
              {place.quality_score > 80 && (
                <Badge label="✦ Highly rated" variant="accent" />
              )}
            </View>

            {/* CTA hint */}
            <View style={styles.ctaHint}>
              <Text size="sm" color={Colors.accentGold} weight="medium">
                {t("common.seeAll")} →
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === "ios" ? Spacing["2xl"] : Spacing.base,
  },
  handleBar: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  emojiText: { fontSize: 26 },
  info: { flex: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stat: { flexDirection: "row", alignItems: "center" },
  ctaHint: { alignItems: "flex-end", marginTop: Spacing.sm },
});
