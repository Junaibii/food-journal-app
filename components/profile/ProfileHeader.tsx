import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { UserProfile } from "@/types";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onSettings?: () => void;
  onFollow?: () => void;
  followPending?: boolean;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onEdit,
  onSettings,
  onFollow,
  followPending = false,
}: Props) {
  const { t, isRTL } = useI18n();

  const initials = (
    profile.display_name ?? profile.username
  )
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      {/* Top row: avatar + action buttons */}
      <View style={[styles.topRow, isRTL && styles.rowRTL]}>
        {/* Avatar */}
        <View style={styles.avatar}>
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <Text size="xl" weight="bold" style={styles.initials}>
              {initials}
            </Text>
          )}
        </View>

        {/* Action buttons */}
        <View style={[styles.actions, isRTL && styles.rowRTL]}>
          {isOwnProfile ? (
            <>
              <Button
                label={t("profile.editProfile")}
                variant="outline"
                size="sm"
                onPress={onEdit}
              />
              <TouchableOpacity style={styles.settingsBtn} onPress={onSettings}>
                <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </>
          ) : (
            <Button
              label={profile.is_following ? t("profile.following_action") : t("profile.follow")}
              variant={profile.is_following ? "outline" : "accent"}
              size="sm"
              onPress={onFollow}
              loading={followPending}
            />
          )}
        </View>
      </View>

      {/* Name + founding badge */}
      <View style={styles.nameRow}>
        <Text size="xl" weight="bold">
          {profile.display_name ?? profile.username}
        </Text>
        {profile.is_founding_contributor && (
          <View style={styles.foundingChip}>
            <Text size="xs" weight="semibold" style={styles.foundingText}>
              ⭐ {t("profile.foundingBadge")}
            </Text>
          </View>
        )}
      </View>

      {/* Username */}
      <Text size="sm" muted style={styles.username}>@{profile.username}</Text>

      {/* Bio */}
      {profile.bio ? (
        <Text size="sm" secondary style={styles.bio}>{profile.bio}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.base,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowRTL: { flexDirection: "row-reverse" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bgElevated,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: { color: Colors.olive },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  foundingChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    backgroundColor: Colors.accentGoldBg,
    borderWidth: 1,
    borderColor: Colors.accentGoldBorder,
  },
  foundingText: { color: Colors.accentGold },
  username: {},
  bio: { lineHeight: 20 },
});
