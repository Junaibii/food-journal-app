/**
 * Shared profile view used by both the own-profile tab and other-user screens.
 * Renders: ProfileHeader, StatsRow, ProfileTabBar, and tab content.
 */
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import type { UserProfile } from "@/types";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { ProfileHeader } from "./ProfileHeader";
import { StatsRow } from "./StatsRow";
import { ProfileTabBar, type ProfileTab } from "./ProfileTabBar";
import { ReviewListItem } from "./ReviewListItem";
import { SaveListItem } from "./SaveListItem";
import { StampCard } from "@/components/passport/StampCard";
import { StampDetailSheet } from "@/components/passport/StampDetailSheet";
import { useUserReviews, useUserStamps, useOwnSaves } from "@/hooks/useProfile";
import { useI18n } from "@/hooks/useI18n";
import { CUISINE_OPTIONS } from "@/constants/cuisines";
import type { StampDefinition, UserStamp } from "@/types";

interface Props {
  profile: UserProfile;
  isOwnProfile: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  // Action handlers (own profile)
  onEdit?: () => void;
  onSettings?: () => void;
  // Action handler (other profile)
  onFollow?: () => void;
  followPending?: boolean;
}

export function ProfileView({
  profile,
  isOwnProfile,
  isRefreshing = false,
  onRefresh,
  onEdit,
  onSettings,
  onFollow,
  followPending,
}: Props) {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<ProfileTab>("reviews");
  const [selectedStamp, setSelectedStamp] = useState<StampDefinition | null>(null);

  const username = profile.username;

  const { data: reviewsPage, isLoading: reviewsLoading } = useUserReviews(username);
  const { data: stampsData, isLoading: stampsLoading } = useUserStamps(username);
  const { data: savesPage, isLoading: savesLoading } = useOwnSaves();

  const reviews = reviewsPage?.data ?? [];
  const stamps = stampsData ?? [];
  const saves = isOwnProfile ? (savesPage?.data ?? []) : [];

  // Build stamp display — only unlocked stamps (profile trophy case)
  const unlockedMap = new Map(
    stamps.map((us) => [us.stamp_id, us]),
  );

  // For StampDetailSheet we need the StampDefinition from the UserStamp
  const selectedUserStamp: UserStamp | null = selectedStamp
    ? (unlockedMap.get(selectedStamp.id) ?? null)
    : null;

  const stampDefs: StampDefinition[] = stamps
    .filter((us) => us.stamp !== null)
    .map((us) => us.stamp as StampDefinition);

  const placeEmojiFor = (tags: string[]) =>
    CUISINE_OPTIONS.find((c) => tags.includes(c.tag))?.emoji ?? "🍽️";

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        ) : undefined
      }
    >
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
        onSettings={onSettings}
        onFollow={onFollow}
        followPending={followPending}
      />

      <StatsRow profile={profile} isOwnProfile={isOwnProfile} />

      <ProfileTabBar
        active={activeTab}
        isOwnProfile={isOwnProfile}
        onChange={setActiveTab}
      />

      {/* ---- Reviews Tab ---- */}
      {activeTab === "reviews" && (
        <View>
          {reviewsLoading ? (
            <ActivityIndicator color={Colors.accent} style={styles.loader} />
          ) : reviews.length === 0 ? (
            <EmptyState label={t("profile.noReviews")} />
          ) : (
            reviews.map((review) => {
              const placeEmoji = "🍽️"; // We don't have place tags on review list item directly
              return (
                <ReviewListItem
                  key={review.id}
                  review={review}
                  placeEmoji={placeEmoji}
                  placeName="Unknown place"
                />
              );
            })
          )}
        </View>
      )}

      {/* ---- Saves Tab (own profile only) ---- */}
      {activeTab === "saves" && isOwnProfile && (
        <View>
          {savesLoading ? (
            <ActivityIndicator color={Colors.accent} style={styles.loader} />
          ) : saves.length === 0 ? (
            <EmptyState label={t("profile.noSaves")} />
          ) : (
            saves.map((save) => (
              <SaveListItem key={save.id} save={save} />
            ))
          )}
        </View>
      )}

      {/* ---- Stamps Tab ---- */}
      {activeTab === "stamps" && (
        <View style={styles.stampsContainer}>
          {stampsLoading ? (
            <ActivityIndicator color={Colors.accent} style={styles.loader} />
          ) : stampDefs.length === 0 ? (
            <EmptyState label={t("profile.noStamps")} />
          ) : (
            <View style={styles.stampsGrid}>
              {stampDefs.map((stamp) => (
                <StampCard
                  key={stamp.id}
                  stamp={stamp}
                  isUnlocked={true}
                  onPress={() => setSelectedStamp(stamp)}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>

      <StampDetailSheet
        stamp={selectedStamp}
        userStamp={selectedUserStamp}
        onClose={() => setSelectedStamp(null)}
      />
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View style={styles.empty}>
      <Text secondary style={{ textAlign: "center" }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: Spacing["3xl"] },
  loader: { padding: Spacing["2xl"] },
  empty: {
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  stampsContainer: { padding: Spacing.base },
  stampsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});
