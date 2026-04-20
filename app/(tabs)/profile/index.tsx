import React, { useState, useCallback } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth";
import { useUserProfile } from "@/hooks/useProfile";
import { Colors } from "@/constants/theme";
import { ProfileView } from "@/components/profile/ProfileView";
import { EditProfileSheet } from "@/components/profile/EditProfileSheet";
import { SettingsSheet } from "@/components/profile/SettingsSheet";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const username = user?.username ?? "";

  const {
    data: profile,
    isRefetching,
    refetch,
  } = useUserProfile(username);

  const [editVisible, setEditVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  if (!user || !profile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.accentGold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ProfileView
        profile={profile}
        isOwnProfile
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
        onEdit={() => setEditVisible(true)}
        onSettings={() => setSettingsVisible(true)}
      />

      <EditProfileSheet
        user={user}
        visible={editVisible}
        onClose={() => setEditVisible(false)}
      />

      <SettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
});
