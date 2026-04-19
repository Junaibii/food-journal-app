import React from "react";
import { View, StyleSheet } from "react-native";
import type { UserProfile } from "@/types";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  profile: UserProfile;
  isOwnProfile: boolean;
}

interface StatItem {
  value: number;
  labelKey: string;
}

export function StatsRow({ profile, isOwnProfile }: Props) {
  const { t, isRTL } = useI18n();

  const stats: StatItem[] = [
    { value: profile.review_count, labelKey: "profile.reviews" },
    { value: profile.stamp_count, labelKey: "profile.stamps" },
    ...(isOwnProfile ? [{ value: profile.save_count, labelKey: "profile.saves" }] : []),
    { value: profile.follower_count, labelKey: "profile.followers" },
    { value: profile.following_count, labelKey: "profile.following" },
  ];

  return (
    <View style={[styles.row, isRTL && styles.rowRTL]}>
      {stats.map((stat, i) => (
        <React.Fragment key={stat.labelKey}>
          <View style={styles.stat}>
            <Text size="lg" weight="bold" style={styles.value}>
              {stat.value}
            </Text>
            <Text size="xs" muted>{t(stat.labelKey)}</Text>
          </View>
          {i < stats.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowRTL: { flexDirection: "row-reverse" },
  stat: { alignItems: "center", gap: 2, flex: 1 },
  value: { color: Colors.textPrimary },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
});
