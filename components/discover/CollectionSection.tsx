/**
 * Renders a single curated collection — a titled section with a subtitle and
 * a horizontally scrollable row of PlaceCards.
 */
import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import type { CuratedCollection, Place } from "@/types";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { PlaceCard } from "./PlaceCard";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  collection: CuratedCollection;
  savedPlaceIds: Set<string>;
  onSaveToggle: (place: Place) => void;
}

export function CollectionSection({
  collection,
  savedPlaceIds,
  onSaveToggle,
}: Props) {
  const { locale, isRTL } = useI18n();

  const title =
    locale === "ar" && collection.title_ar
      ? collection.title_ar
      : collection.title_en;

  const description =
    locale === "ar" && collection.description_ar
      ? collection.description_ar
      : collection.description_en;

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <Text
          size="base"
          weight="semibold"
          style={[styles.title, isRTL && styles.textRTL]}
        >
          {title}
        </Text>
        {description ? (
          <Text
            size="sm"
            style={[styles.description, isRTL && styles.textRTL]}
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}
      </View>

      {/* Horizontal place cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isRTL && styles.scrollContentRTL,
        ]}
        style={isRTL ? styles.scrollRTL : undefined}
      >
        {collection.places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            isSaved={savedPlaceIds.has(place.id)}
            onSaveToggle={onSaveToggle}
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
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    gap: 3,
  },
  title: {
    color: Colors.textPrimary,
  },
  description: {
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  textRTL: { textAlign: "right" },
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
});
