/**
 * Place detail screen.
 *
 * Shows: header (name, tags, rating, actions), photo grid,
 * all reviews with infinite scroll, and a write-review FAB.
 */
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
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { PlaceHeader } from "@/components/place/PlaceHeader";
import { ReviewCard } from "@/components/place/ReviewCard";
import { PhotoGrid } from "@/components/place/PhotoGrid";
import { usePlace, usePlacePhotos, usePlaceReviews } from "@/hooks/usePlaces";
import { savePlace, unsavePlace, getSaves } from "@/services/saves";
import { useI18n } from "@/hooks/useI18n";
import { useQuery } from "@tanstack/react-query";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
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

  // Save state
  const { data: saves } = useQuery({
    queryKey: ["saves"],
    queryFn: () => getSaves(),
  });
  const currentSave = saves?.data.find((s) => s.place_id === id);
  const isSaved = Boolean(currentSave);

  const saveMutation = useMutation({
    mutationFn: () =>
      isSaved && currentSave
        ? unsavePlace(currentSave.id)
        : savePlace(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saves"] }),
  });

  // List items: [header, photos_section, reviews_header, ...reviews]
  type ListItem =
    | { type: "header" }
    | { type: "photos" }
    | { type: "reviews_label" }
    | { type: "review"; review: Review }
    | { type: "empty_reviews" };

  const items: ListItem[] = [
    { type: "header" },
    ...(photos.length > 0 ? [{ type: "photos" as const }] : []),
    { type: "reviews_label" },
    ...(reviews.length > 0
      ? reviews.map((r) => ({ type: "review" as const, review: r }))
      : [{ type: "empty_reviews" as const }]),
  ];

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (!place) return null;
      switch (item.type) {
        case "header":
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
              <Text size="sm" weight="semibold" secondary style={styles.sectionLabel}>
                {t("place.photos").toUpperCase()}
              </Text>
              <PhotoGrid photos={photos} />
            </View>
          );
        case "reviews_label":
          return (
            <Text size="sm" weight="semibold" secondary style={[styles.sectionLabel, { paddingHorizontal: Spacing.base }]}>
              {t("place.reviews").toUpperCase()} ({place.review_count})
            </Text>
          );
        case "review":
          return <ReviewCard review={item.review} />;
        case "empty_reviews":
          return (
            <View style={styles.emptyReviews}>
              <Text secondary>{t("place.noReviews")}</Text>
            </View>
          );
      }
    },
    [place, isSaved, photos, t, saveMutation],
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

  return (
    <View style={styles.container}>
      {/* Back button */}
      <SafeAreaView style={styles.backBar} edges={["top"]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
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

      {/* Write review FAB */}
      <View style={styles.fab}>
        <Button
          label={t("place.writeReview")}
          icon={<Ionicons name="create-outline" size={16} color={Colors.textInverse} />}
          onPress={() => {
            useComposeStore.getState().reset();
            useComposeStore.getState().setPlace(place);
            router.push(`/review/compose?placeId=${id}`);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg },
  backBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.base,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: { paddingTop: 60, paddingBottom: 100 },
  section: { gap: Spacing.sm, marginBottom: Spacing.md },
  sectionLabel: {
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  emptyReviews: {
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: Spacing.xl,
    left: Spacing.base,
    right: Spacing.base,
  },
});
