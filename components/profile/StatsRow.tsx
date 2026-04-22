import React from "react";
import { View, StyleSheet } from "react-native";
import type { UserProfile } from "@/types";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  profile: UserProfile;
  isOwnProfile: boolean;
}

interface StatItem {
  value: number;
  labelKey: string;
  highlight?: boolean;
  emoji: string;
}

export function StatsRow({ profile, isOwnProfile }: Props) {
  const { t, isRTL } = useI18n();

  const stats: StatItem[] = [
    { value: profile.review_count, labelKey: "profile.reviews", highlight: true, emoji: "✍️" },
    { value: profile.stamp_count, labelKey: "profile.stamps", highlight: true, emoji: "🏅" },
    ...(isOwnProfile ? [{ value: profile.save_count, labelKey: "profile.saves", emoji: "🔖" }] : []),
    { value: profile.follower_count, labelKey: "profile.followers", emoji: "👥" },
    { value: profile.following_count, labelKey: "profile.following", emoji: "➕" },
  ];

  return (
    <View style={[styles.row, isRTL && styles.rowRTL]}>
      {stats.map((stat, i) => (
        <React.Fragment key={stat.labelKey}>
          <View style={styles.stat}>
            <Text style={styles.statEmoji}>{stat.emoji}</Text>
            <Text
              size="xl"
              weight="bold"
              style={[styles.value, stat.highlight && styles.valueHighlight]}
            >
              {stat.value}
            </Text>
            <Text size="xs" style={styles.label}>{t(stat.labelKey)}</Text>
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
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  rowRTL: { flexDirection: "row-reverse" },
  stat: { alignItems: "center", gap: 3, flex: 1 },
  statEmoji: { fontSize: 16, lineHeight: 20 },
  value: { color: Colors.textPrimary },
  valueHighlight: { color: Colors.accentGold },
  label: {
    color: Colors.textMuted,
    fontFamily: Typography.fontSans,
    letterSpacing: 0.2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
});
