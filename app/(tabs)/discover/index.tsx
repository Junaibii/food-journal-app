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
import { useAuthStore } from "@/stores/auth";
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

const FILTERS = ["Near me", "Omakase", "Levantine", "Open now"];

export default function DiscoverScreen() {
  const { t, locale, isRTL } = useI18n();
  const [city, setCity] = useState<City>("dubai");
  const [activeFilter, setActiveFilter] = useState("Near me");
  const user = useAuthStore((s) => s.user);
  const firstName = user?.display_name?.split(" ")[0] ?? user?.username ?? "you";
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
      {/* ── Hero header ── */}
      <View style={styles.hero}>
        {/* Eyebrow: city · today */}
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
                <Text size="xs" style={isActive ? styles.cityChipTextActive : styles.cityChipText}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Playfair headline */}
        <Text serif size="2xl" style={styles.heroHeadline}>
          Where to next,{"\n"}
          <Text serif italic size="2xl" color={Colors.accentGold}>{firstName}</Text>
        </Text>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text size="xs" style={active ? styles.filterChipTextActive : styles.filterChipText}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
          <Text size="xs" style={[styles.sectionLabel, isRTL && styles.textRTL]}>
            FROM PEOPLE YOU TRUST
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
  textRTL: { textAlign: "right" },

  // Hero header
  hero: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  heroHeadline: {
    color: Colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.5,
  },

  // City picker (eyebrow)
  cityPicker: { flexDirection: "row", gap: Spacing.xs },
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

  // Filter pills
  filterRow: { gap: Spacing.xs, paddingRight: Spacing.base },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterChipText: { color: Colors.textMuted },
  filterChipTextActive: { color: Colors.textInverse },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: Spacing.lg, paddingBottom: Spacing["3xl"] },

  // Section labels
  sectionHeader: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  sectionHeaderSpaced: { marginTop: Spacing.lg },
  sectionLabel: {
    color: Colors.accentGold,
    letterSpacing: 1.4,
    fontFamily: Typography.fontSans,
  },

  // Empty state
  empty: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xl,
  },
});
