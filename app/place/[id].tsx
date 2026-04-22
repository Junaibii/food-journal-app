import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useComposeStore } from "@/stores/compose";

import type { Review } from "@/types";
import { Colors, Spacing, Radii, Typography } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { PlaceHeader } from "@/components/place/PlaceHeader";
import { ReviewCard } from "@/components/place/ReviewCard";
import { PhotoGrid } from "@/components/place/PhotoGrid";
import { usePlace, usePlacePhotos, usePlaceReviews } from "@/hooks/usePlaces";
import { savePlace, unsavePlace, getSaves } from "@/services/saves";
import { useI18n } from "@/hooks/useI18n";
import { useQuery } from "@tanstack/react-query";
import { CUISINE_OPTIONS } from "@/constants/cuisines";

// Match cuisine bg colors from PlaceCard
const CUISINE_BG: Record<string, string> = {
  arabic: "#C4702A", emirati: "#8B5E3C", lebanese: "#C26B3A",
  turkish: "#9B4A1E", persian: "#A04E2A", mediterranean: "#4A8C72",
  indian: "#C8831A", pakistani: "#B87A20", thai: "#C49220",
  japanese: "#4A7A8C", korean: "#5C6E8A", chinese: "#B83A2A",
  italian: "#C03A20", american: "#5C3D2E", seafood: "#2E7DA8",
  cafe: "#8C5A42", brunch: "#9C6448", french: "#7A5C7A",
  desserts: "#9C4A7A", mexican: "#B85A20",
};
const DEFAULT_BG = "#7A6B5A";

function placeBg(tags: string[]): string {
  for (const t of tags) if (CUISINE_BG[t]) return CUISINE_BG[t];
  return DEFAULT_BG;
}

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useI18n();
  const qc = useQueryClient();

  const { data: place, isLoading: placeLoading, error: placeError } = usePlace(id ?? null);
  const { data: photos = [] } = usePlacePhotos(id ?? "");
  const {
    data: reviewPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = usePlaceReviews(id ?? "");

  const reviews: Review[] = reviewPages?.pages.flatMap((p) => p.data) ?? [];

  const { data: saves } = useQuery({
    queryKey: ["saves"],
    queryFn: () => getSaves(),
  });
  const currentSave = saves?.data.find((s) => s.place_id === id);
  const isSaved = Boolean(currentSave);

  const saveMutation = useMutation({
    mutationFn: () =>
      isSaved && currentSave ? unsavePlace(currentSave.id) : savePlace(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saves"] }),
  });

  type ListItem =
    | { type: "hero" }
    | { type: "detail" }
    | { type: "photos" }
    | { type: "reviews_label" }
    | { type: "review"; review: Review }
    | { type: "empty_reviews" };

  const items: ListItem[] = [
    { type: "hero" },
    { type: "detail" },
    ...(photos.length > 0 ? [{ type: "photos" as const }] : []),
    { type: "reviews_label" },
    ...(reviews.length > 0
      ? reviews.map((r) => ({ type: "review" as const, review: r }))
      : [{ type: "empty_reviews" as const }]),
  ];

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (!place) return null;
      const cuisineOption = CUISINE_OPTIONS.find((c) => place.cuisine_tags.includes(c.tag));
      const heroEmoji = cuisineOption?.emoji ?? "🍽️";
      const heroBg = placeBg(place.cuisine_tags);
      const placeName = locale === "ar" && place.name_ar ? place.name_ar : place.name_en;

      switch (item.type) {
        case "hero":
          return (
            <View style={[styles.heroBand, { backgroundColor: heroBg }]}>
              <View style={styles.heroBandOverlay} />
              <Text style={styles.heroEmoji}>{heroEmoji}</Text>
              <Text serif size="2xl" style={styles.heroName} numberOfLines={2}>
                {placeName}
              </Text>
            </View>
          );
        case "detail":
          return (
            <PlaceHeader
              place={place}
              isSaved={isSaved}
              onSave={() => saveMutation.mutate()}
            />
          );
        case "photos":
          return (
            <View style={styles.section}>
              <Text size="sm" weight="semibold" style={styles.sectionLabel}>
                Photos
              </Text>
              <PhotoGrid photos={photos} />
            </View>
          );
        case "reviews_label":
          return (
            <View style={styles.sectionRow}>
              <Text size="sm" weight="semibold" style={styles.sectionLabel}>
                Reviews
              </Text>
              {place.review_count > 0 && (
                <Text size="sm" style={styles.sectionCount}>
                  {place.review_count}
                </Text>
              )}
            </View>
          );
        case "review":
          return <ReviewCard review={item.review} />;
        case "empty_reviews":
          return (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyEmoji}>✍️</Text>
              <Text size="sm" secondary style={{ textAlign: "center" }}>
                {t("place.noReviews")}
              </Text>
              <Text size="xs" style={styles.emptyHint}>
                Be the first to review this place
              </Text>
            </View>
          );
      }
    },
    [place, isSaved, photos, t, saveMutation, locale],
  );

  if (placeLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  if (placeError || !place) {
    return (
      <View style={styles.centered}>
        <Text secondary>{t("common.error")}</Text>
        <Button label={t("common.retry")} onPress={() => router.back()} style={{ marginTop: Spacing.md }} />
      </View>
    );
  }

  const placeName = locale === "ar" && place.name_ar ? place.name_ar : place.name_en;

  return (
    <View style={styles.container}>
      {/* Floating top bar — back + place name */}
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={Colors.textInverse} />
        </TouchableOpacity>
        <Text
          size="sm"
          weight="semibold"
          numberOfLines={1}
          style={styles.topBarTitle}
        >
          {placeName}
        </Text>
        <View style={styles.topBarSpacer} />
      </SafeAreaView>

      <FlashList
        data={items}
        renderItem={renderItem}
        estimatedItemSize={80}
        keyExtractor={(item, i) =>
          item.type === "review" ? item.review.id : `${item.type}_${i}`
        }
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.accent}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={Colors.accent} style={{ padding: Spacing.base }} />
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Circular write-review FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          useComposeStore.getState().reset();
          useComposeStore.getState().setPlace(place);
          router.push(`/review/compose?placeId=${id}`);
        }}
      >
        <Ionicons name="create-outline" size={22} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg },

  // Top bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: "transparent",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(26,32,16,0.55)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  topBarTitle: {
    flex: 1,
    color: Colors.textInverse,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  topBarSpacer: { width: 36 },

  // Hero band
  heroBand: {
    height: 200,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  heroBandOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  heroEmoji: { fontSize: 52, lineHeight: 60 },
  heroName: {
    color: Colors.textInverse,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  listContent: { paddingBottom: 100 },

  section: { gap: Spacing.sm, marginBottom: Spacing.md, paddingHorizontal: Spacing.base },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  sectionCount: {
    color: Colors.textMuted,
  },
  emptyReviews: {
    padding: Spacing["2xl"],
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyEmoji: { fontSize: 32 },
  emptyHint: {
    color: Colors.textMuted,
    textAlign: "center",
  },

  // Circular FAB
  fab: {
    position: "absolute",
    bottom: Spacing.xl,
    right: Spacing.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
