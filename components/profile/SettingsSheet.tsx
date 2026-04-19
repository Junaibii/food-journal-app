import React from "react";
import {
  Modal,
  Pressable,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { useI18n, initI18n } from "@/hooks/useI18n";
import { useAuthStore } from "@/stores/auth";
import { useUpdateProfile } from "@/hooks/useProfile";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsSheet({ visible, onClose }: Props) {
  const { t, locale, isRTL } = useI18n();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const updateUser = useAuthStore((s) => s.updateUser);
  const updateProfile = useUpdateProfile();

  const handleLanguageSwitch = async (newLocale: "en" | "ar") => {
    if (newLocale === locale) return;
    try {
      // Update backend + auth store
      await updateProfile.mutateAsync({ locale: newLocale });
      updateUser({ locale: newLocale });
      // Apply i18n immediately
      initI18n(newLocale);
      onClose();
      // Replace route to force re-render with new locale
      router.replace("/(tabs)/profile");
      Alert.alert("", t("profile.languageChanged"));
    } catch {
      Alert.alert("Error", t("common.error"));
    }
  };

  const handleLogout = () => {
    Alert.alert("", t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: () => {
          clearAuth();
          onClose();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <Text size="md" weight="semibold" style={[styles.title, isRTL && styles.titleRTL]}>
            {t("profile.settings")}
          </Text>

          {/* Language */}
          <View style={styles.section}>
            <Text size="sm" secondary weight="semibold" style={[styles.sectionLabel, isRTL && styles.titleRTL]}>
              {t("profile.language").toUpperCase()}
            </Text>
            <View style={[styles.langRow, isRTL && styles.rowRTL]}>
              {(["en", "ar"] as const).map((lang) => {
                const isActive = locale === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langBtn, isActive && styles.langBtnActive]}
                    onPress={() => handleLanguageSwitch(lang)}
                    activeOpacity={0.7}
                  >
                    <Text
                      size="base"
                      weight={isActive ? "semibold" : "regular"}
                      style={isActive ? styles.langTextActive : styles.langText}
                    >
                      {lang === "en" ? "English" : "العربية"}
                    </Text>
                    {isActive && (
                      <Ionicons name="checkmark" size={16} color={Colors.accent} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Logout */}
          <TouchableOpacity
            style={[styles.logoutRow, isRTL && styles.rowRTL]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text size="base" style={styles.logoutText}>
              {t("profile.logout")}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing["3xl"],
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  title: {},
  titleRTL: { textAlign: "right" },
  section: { gap: Spacing.sm },
  sectionLabel: { letterSpacing: 0.8 },
  rowRTL: { flexDirection: "row-reverse" },
  langRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  langBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  langBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  langText: { color: Colors.textSecondary },
  langTextActive: { color: Colors.accent },
  divider: { height: 1, backgroundColor: Colors.border },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  logoutText: { color: Colors.error },
});
