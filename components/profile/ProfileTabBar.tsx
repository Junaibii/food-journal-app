import React from "react";
import { View, TouchableOpacity, Text as RNText, StyleSheet } from "react-native";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useI18n } from "@/hooks/useI18n";

export type ProfileTab = "reviews" | "saves" | "stamps";

const OWN_TABS = [
  { key: "reviews" as ProfileTab, labelKey: "profile.reviews" },
  { key: "saves" as ProfileTab, labelKey: "profile.saves" },
  { key: "stamps" as ProfileTab, labelKey: "profile.stamps" },
];

const OTHER_TABS = [
  { key: "reviews" as ProfileTab, labelKey: "profile.reviews" },
  { key: "stamps" as ProfileTab, labelKey: "profile.stamps" },
];

interface Props {
  active: ProfileTab;
  isOwnProfile: boolean;
  onChange: (tab: ProfileTab) => void;
}

export function ProfileTabBar({ active, isOwnProfile, onChange }: Props) {
  const { t, isRTL } = useI18n();
  const tabs = isOwnProfile ? OWN_TABS : OTHER_TABS;

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            {/* Gold pip indicator above label */}
            <View style={[styles.pip, isActive && styles.pipActive]} />
            <RNText
              style={[
                styles.label,
                isActive ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {t(tab.labelKey)}
            </RNText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.bgSurface,
  },
  containerRTL: { flexDirection: "row-reverse" },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingTop: 10,
    gap: 4,
  },
  pip: {
    width: 18,
    height: 3,
    borderRadius: 100,
    backgroundColor: "transparent",
  },
  pipActive: {
    backgroundColor: Colors.accentGold,
  },
  label: {
    fontSize: Typography.sizes.sm,
    textAlign: "center",
  },
  labelActive: {
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  labelInactive: {
    fontWeight: Typography.weights.regular,
    color: Colors.textMuted,
  },
});
