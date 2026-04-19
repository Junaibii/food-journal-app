/**
 * Passport screen — stamp collection with category sections,
 * overall progress bar, and stamp detail sheet.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth";
import { useAllStamps, useMyStamps, useCheckStamps } from "@/hooks/usePassport";
import { useI18n } from "@/hooks/useI18n";
import { StampCard } from "@/components/passport/StampCard";
import { StampDetailSheet } from "@/components/passport/StampDetailSheet";
import { Text } from "@/components/ui/Text";
import { Colors, Spacing, Radii } from "@/constants/theme";
import type { StampDefinition, UserStamp } from "@/types";

type Category = "founding" | "milestone" | "cuisine" | "neighborhood";

const CATEGORY_ORDER: Category[] = ["founding", "milestone", "cuisine", "neighborhood"];

export default function PassportScreen() {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);

  const { data: allStamps = [], isLoading: stampsLoading } = useAllStamps();
  const { data: myStamps = [], isLoading: myLoading } = useMyStamps();
  const checkMutation = useCheckStamps();

  const [selected, setSelected] = useState<StampDefinition | null>(null);

  // Build lookup: stamp_id → UserStamp
  const unlockedMap = useMemo(
    () =>
      new Map(myStamps.map((us) => [us.stamp_id, us])),
    [myStamps],
  );

  // Group all stamps by category
  const grouped = useMemo(() => {
    const map = new Map<string, StampDefinition[]>();
    for (const stamp of allStamps) {
      const cat = stamp.is_founding ? "founding" : (stamp.category ?? "milestone");
      const list = map.get(cat) ?? [];
      list.push(stamp);
      map.set(cat, list);
    }
    return map;
  }, [allStamps]);

  const totalUnlocked = myStamps.length;
  const totalStamps = allStamps.length;
  const progressFraction = totalStamps > 0 ? totalUnlocked / totalStamps : 0;

  const selectedUserStamp = selected
    ? (unlockedMap.get(selected.id) ?? null)
    : null;

  const handleCheckPress = useCallback(() => {
    checkMutation.mutate();
  }, [checkMutation]);

  if (stampsLoading || myLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text size="xl" weight="bold">{t("passport.title")}</Text>
        <TouchableOpacity
          style={styles.checkBtn}
          onPress={handleCheckPress}
          disabled={checkMutation.isPending}
        >
          {checkMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.accent} />
          ) : (
            <Ionicons name="refresh-outline" size={20} color={Colors.accent} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Booklet cover card */}
        <View style={styles.bookletCard}>
          {user?.is_founding_contributor && (
            <View style={styles.foundingBadge}>
              <Text size="xs" weight="semibold" style={styles.foundingText}>
                ⭐ {t("passport.foundingBadge")}
              </Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text size="2xl" weight="bold" style={styles.accentText}>
                {totalUnlocked}
              </Text>
              <Text size="xs" style={styles.bookletLabel}>{t("passport.unlocked")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text size="2xl" weight="bold" style={styles.bookletValue}>{totalStamps}</Text>
              <Text size="xs" style={styles.bookletLabel}>{t("passport.stamps")}</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progressFraction * 100)}%` },
                ]}
              />
            </View>
            <Text size="xs" style={[styles.progressLabel, styles.bookletLabel]}>
              {Math.round(progressFraction * 100)}%
            </Text>
          </View>
        </View>

        {/* Sections by category */}
        {CATEGORY_ORDER.map((cat) => {
          const stamps = grouped.get(cat);
          if (!stamps || stamps.length === 0) return null;

          const catUnlocked = stamps.filter((s) => unlockedMap.has(s.id)).length;
          const catKey = `passport.category.${cat}` as const;

          return (
            <View key={cat} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text size="sm" weight="semibold" secondary style={styles.sectionTitle}>
                  {t(catKey as any).toUpperCase()}
                </Text>
                <Text size="xs" secondary>
                  {catUnlocked}/{stamps.length}
                </Text>
              </View>

              {/* Mini progress bar */}
              <View style={styles.catProgressTrack}>
                <View
                  style={[
                    styles.catProgressFill,
                    { width: `${stamps.length > 0 ? (catUnlocked / stamps.length) * 100 : 0}%` },
                  ]}
                />
              </View>

              {/* Stamp grid */}
              <View style={styles.grid}>
                {stamps.map((stamp) => (
                  <StampCard
                    key={stamp.id}
                    stamp={stamp}
                    isUnlocked={unlockedMap.has(stamp.id)}
                    onPress={() => setSelected(stamp)}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <StampDetailSheet
        stamp={selected}
        userStamp={selectedUserStamp}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, gap: Spacing.xl, paddingBottom: Spacing["3xl"] },

  // Booklet card
  bookletCard: {
    backgroundColor: Colors.olive,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  foundingBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: "transparent",
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.accentGoldBorder,
  },
  foundingText: {
    color: Colors.accentGold,
  },
  bookletLabel: { color: Colors.textInverse, opacity: 0.75 },
  bookletValue: { color: Colors.textInverse },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  statItem: {
    alignItems: "center",
    gap: 2,
  },
  accentText: {
    color: Colors.accentGold,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: Radii.pill,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accentGold,
    borderRadius: Radii.pill,
  },
  progressLabel: {
    minWidth: 32,
    textAlign: "right",
  },

  // Sections
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    letterSpacing: 0.8,
  },
  catProgressTrack: {
    height: 3,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radii.pill,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  catProgressFill: {
    height: "100%",
    backgroundColor: Colors.accentGoldBg,
    borderRadius: Radii.pill,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});
