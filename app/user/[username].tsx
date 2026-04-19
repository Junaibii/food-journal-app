import React, { useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserProfile } from "@/hooks/useProfile";
import { Colors, Spacing } from "@/constants/theme";
import { ProfileView } from "@/components/profile/ProfileView";
import { useFollowMutation } from "@/hooks/useProfile";
import { useI18n } from "@/hooks/useI18n";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { isRTL } = useI18n();

  const {
    data: profile,
    isLoading,
    isRefetching,
    refetch,
  } = useUserProfile(username ?? "");

  const { follow, unfollow } = useFollowMutation(username ?? "");

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  const handleFollow = useCallback(() => {
    if (!profile) return;
    if (profile.is_following) {
      unfollow.mutate();
    } else {
      follow.mutate();
    }
  }, [profile, follow, unfollow]);

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Back nav */}
      <TouchableOpacity
        style={[styles.backBtn, isRTL && styles.backBtnRTL]}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Ionicons
          name={isRTL ? "chevron-forward" : "chevron-back"}
          size={24}
          color={Colors.textPrimary}
        />
      </TouchableOpacity>

      <ProfileView
        profile={profile}
        isOwnProfile={false}
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
        onFollow={handleFollow}
        followPending={follow.isPending || unfollow.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  backBtn: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.base,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnRTL: {
    left: undefined,
    right: Spacing.base,
  },
});
