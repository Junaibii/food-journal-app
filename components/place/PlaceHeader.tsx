import React from "react";
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Place } from "@/types";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { CUISINE_OPTIONS, PRICE_TIERS } from "@/constants/cuisines";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  place: Place;
  isSaved: boolean;
  onSave: () => void;
}

export function PlaceHeader({ place, isSaved, onSave }: Props) {
  const { locale, t } = useI18n();

  const name = locale === "ar" && place.name_ar ? place.name_ar : place.name_en;
  const address = locale === "ar" && place.address_ar ? place.address_ar : place.address_en;

  const cuisines = CUISINE_OPTIONS.filter((c) => place.cuisine_tags.includes(c.tag));
  const priceTier = PRICE_TIERS.find((p) => p.value === place.price_tier);

  const openMaps = () => {
    if (!place.latitude || !place.longitude) return;
    const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
    const latLng = `${place.latitude},${place.longitude}`;
    const label = encodeURIComponent(place.name_en);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (url) Linking.openURL(url);
  };

  const callPhone = () => {
    if (place.phone) Linking.openURL(`tel:${place.phone}`);
  };

  return (
    <View style={styles.container}>
      {/* Emoji + name block */}
      <View style={styles.nameRow}>
        <View style={styles.emojiBox}>
          <Text style={styles.emoji}>
            {cuisines[0]?.emoji ?? "🍽️"}
          </Text>
        </View>
        <View style={styles.nameInfo}>
          <Text size="xl" weight="bold" numberOfLines={2}>{name}</Text>
          {address && (
            <Text size="sm" secondary numberOfLines={1} style={{ marginTop: 2 }}>
              {address}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, isSaved && styles.saveBtnActive]}
          onPress={onSave}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isSaved ? Colors.accentGold : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Tags row */}
      <View style={styles.tagsRow}>
        {cuisines.map((c) => (
          <Badge
            key={c.tag}
            label={locale === "ar" ? c.label_ar : c.label_en}
            variant="default"
          />
        ))}
        {priceTier && (
          <Badge label={priceTier.symbol} variant="muted" />
        )}
        {place.neighborhood && (
          <Badge label={place.neighborhood} variant="muted" />
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {place.avg_rating !== null && (
          <View style={styles.stat}>
            <RatingStars rating={place.avg_rating} size="md" showNumber />
            <Text size="sm" secondary style={{ marginStart: Spacing.xs }}>
              ({place.review_count})
            </Text>
          </View>
        )}
        {place.quality_score > 80 && (
          <Badge label="✦ Highly rated" variant="accent" />
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {place.phone && (
          <TouchableOpacity style={styles.actionBtn} onPress={callPhone}>
            <Ionicons name="call-outline" size={16} color={Colors.textPrimary} />
            <Text size="sm" weight="medium" style={{ marginStart: Spacing.xs }}>
              {t("place.phone")}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={openMaps}>
          <Ionicons name="navigate-outline" size={16} color={Colors.textPrimary} />
          <Text size="sm" weight="medium" style={{ marginStart: Spacing.xs }}>
            {t("place.directions")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.base, gap: Spacing.md },
  nameRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  emojiBox: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: { fontSize: 28 },
  nameInfo: { flex: 1 },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  saveBtnActive: {
    borderColor: Colors.accentGold,
    backgroundColor: Colors.accentGoldBg,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  statsRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  stat: { flexDirection: "row", alignItems: "center" },
  actions: { flexDirection: "row", gap: Spacing.sm },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
});
