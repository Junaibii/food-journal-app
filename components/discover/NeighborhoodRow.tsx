/**
 * A horizontal scroll row for a single neighbourhood bucket.
 * Renders the neighbourhood name as a section label, followed by a
 * horizontally scrollable list of PlaceCards.
 */
import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import type { NeighborhoodBucket, Place } from "@/types";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { PlaceCard } from "./PlaceCard";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  bucket: NeighborhoodBucket;
  savedPlaceIds: Set<string>;
  onSaveToggle: (place: Place) => void;
}

export function NeighborhoodRow({ bucket, savedPlaceIds, onSaveToggle }: Props) {
  const { isRTL } = useI18n();

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <Text
          size="base"
          weight="semibold"
          style={[styles.title, isRTL && styles.textRTL]}
        >
          {bucket.neighborhood}
        </Text>
        <Text size="xs" style={styles.count}>
          {bucket.place_count} {bucket.place_count === 1 ? "place" : "places"}
        </Text>
      </View>

      {/* Horizontal place cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isRTL && styles.scrollContentRTL,
        ]}
        // Reverse the scroll direction for RTL so drag-right scrolls forward.
        style={isRTL ? styles.scrollRTL : undefined}
      >
        {bucket.places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            isSaved={savedPlaceIds.has(place.id)}
            onSaveToggle={onSaveToggle}
            style={styles.card}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  headerRTL: { flexDirection: "row-reverse" },
  title: {
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  textRTL: { textAlign: "right" },
  count: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  scrollContentRTL: {
    flexDirection: "row-reverse",
  },
  scrollRTL: {
    transform: [{ scaleX: -1 }],
  },
  card: {
    // No extra style needed — PlaceCard has a fixed CARD_WIDTH.
  },
});
