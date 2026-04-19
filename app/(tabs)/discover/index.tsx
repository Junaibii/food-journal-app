/**
 * Discover screen — curated list view with two sections:
 *   1. Neighbourhood buckets   — group places by neighbourhood, one
 *                                horizontal-scroll row per neighbourhood.
 *   2. Curated collections     — editor-maintained thematic lists
 *                                (e.g. "Best for breakfast", "Hidden gems").
 *
 * Features: city picker, pull-to-refresh, skeleton loaders, RTL-aware layout.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNeighborhoodBuckets, useCuratedCollections } from "@/hooks/useDiscover";
import { useOwnSaves } from "@/hooks/useProfile";
import { savePlace, unsavePlace } from "@/services/saves";
import { useQueryClient } from "@tanstack/react-query";
import type { City, Place } from "@/types";
import { Colors, Spacing, Typography, Radii } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { NeighborhoodRow } from "@/components/discover/NeighborhoodRow";
import { CollectionSection } from "@/components/discover/CollectionSection";
import { SkeletonRow } from "@/components/discover/SkeletonCard";
import { useI18n } from "@/hooks/useI18n";

const CITIES: { key: City; labelEn: string; labelAr: string }[] = [
  { key: "dubai", labelEn: "Dubai", labelAr: "دبي" },
  { key: "abu_dhabi", labelEn: "Abu Dhabi", labelAr: "أبوظبي" },
];

export default function DiscoverScreen() {
  const { t, locale, isRTL } = useI18n();
  const [city, setCity] = useState<City>("dubai");
  const qc = useQueryClient();

  const {
    data: buckets,
    isLoading: bucketsLoading,
    refetch: refetchBuckets,
    isRefetching: isRefetchingBuckets,
  } = useNeighborhoodBuckets(city);

  const {
    data: collections,
    isLoading: collectionsLoading,
    refetch: refetchCollections,
    isRefetching: isRefetchingCollections,
  } = useCuratedCollections(city);

  const { data: savesPage } = useOwnSaves();

  // Build a Set of saved place IDs for O(1) lookup in card renders.
  const savedPlaceIds = useMemo<Set<string>>(
    () => new Set((savesPage?.data ?? []).map((s) => s.place_id)),
    [savesPage],
  );

  // Build a place-id → save-record-id map for unsaving.
  const saveIdByPlaceId = useMemo<Map<string, string>>(
    () => new Map((savesPage?.data ?? []).map((s) => [s.place_id, s.id])),
    [savesPage],
  );

  const handleSaveToggle = useCallback(
    async (place: Place) => {
      if (savedPlaceIds.has(place.id)) {
        const saveId = saveIdByPlaceId.get(place.id);
        if (saveId) {
          await unsavePlace(saveId);
          qc.invalidateQueries({ queryKey: ["saves"] });
        }
      } else {
        await savePlace(place.id);
        qc.invalidateQueries({ queryKey: ["saves"] });
      }
    },
    [savedPlaceIds, saveIdByPlaceId, qc],
  );

  const handleRefresh = useCallback(() => {
    refetchBuckets();
    refetchCollections();
  }, [refetchBuckets, refetchCollections]);

  const isRefreshing = isRefetchingBuckets || isRefetchingCollections;
  const isLoading = bucketsLoading || collectionsLoading;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <Text size="xl" weight="bold" style={isRTL ? styles.textRTL : undefined}>
          {t("tabs.discover")}
        </Text>

        {/* City picker */}
        <View style={[styles.cityPicker, isRTL && styles.cityPickerRTL]}>
          {CITIES.map(({ key, labelEn, labelAr }) => {
            const label = locale === "ar" ? labelAr : labelEn;
            const isActive = city === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.cityChip, isActive && styles.cityChipActive]}
                onPress={() => setCity(key)}
              >
                <Text
                  size="xs"
                  weight={isActive ? "semibold" : "regular"}
                  style={isActive ? styles.cityChipTextActive : styles.cityChipText}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accentGold}
          />
        }
      >
        {/* ── Section 1: Neighbourhood buckets ── */}
        <View style={styles.sectionHeader}>
          <Text
            size="sm"
            weight="semibold"
            style={[styles.sectionLabel, isRTL && styles.textRTL]}
          >
            {t("discover.neighborhoods")}
          </Text>
        </View>

        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (buckets?.length ?? 0) === 0 ? (
          <EmptyState label={t("discover.noNeighborhoods")} />
        ) : (
          buckets!.map((bucket) => (
            <NeighborhoodRow
              key={bucket.neighborhood}
              bucket={bucket}
              savedPlaceIds={savedPlaceIds}
              onSaveToggle={handleSaveToggle}
            />
          ))
        )}

        {/* ── Section 2: Curated collections ── */}
        <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
          <Text
            size="sm"
            weight="semibold"
            style={[styles.sectionLabel, isRTL && styles.textRTL]}
          >
            {t("discover.collections")}
          </Text>
        </View>

        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (collections?.length ?? 0) === 0 ? (
          <EmptyState label={t("discover.noCollections")} />
        ) : (
          collections!.map((collection) => (
            <CollectionSection
              key={collection.id}
              collection={collection}
              savedPlaceIds={savedPlaceIds}
              onSaveToggle={handleSaveToggle}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View style={styles.empty}>
      <Text secondary style={{ textAlign: "center" }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerRTL: { flexDirection: "row-reverse" },
  textRTL: { textAlign: "right" },

  // City picker
  cityPicker: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  cityPickerRTL: { flexDirection: "row-reverse" },
  cityChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  cityChipActive: {
    borderColor: Colors.accentGoldBorder,
    backgroundColor: Colors.accentGoldBg,
  },
  cityChipText: { color: Colors.textMuted },
  cityChipTextActive: { color: Colors.accentGold },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: Spacing.lg, paddingBottom: Spacing["3xl"] },

  // Section labels
  sectionHeader: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  sectionHeaderSpaced: {
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontSize: Typography.sizes.xs,
  },

  // Empty state
  empty: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xl,
  },
});
