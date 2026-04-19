import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import type { User } from "@/types";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { useI18n } from "@/hooks/useI18n";
import { useUpdateProfile } from "@/hooks/useProfile";

interface Props {
  user: User;
  visible: boolean;
  onClose: () => void;
}

export function EditProfileSheet({ user, visible, onClose }: Props) {
  const { t, isRTL } = useI18n();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(user.display_name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");

  // Reset to current values whenever the sheet opens
  useEffect(() => {
    if (visible) {
      setDisplayName(user.display_name ?? "");
      setBio(user.bio ?? "");
    }
  }, [visible, user.display_name, user.bio]);

  const isDirty =
    displayName !== (user.display_name ?? "") ||
    bio !== (user.bio ?? "");

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      });
      onClose();
    } catch {
      Alert.alert("Error", t("common.error"));
    }
  };

  const handleClose = () => {
    if (isDirty) {
      Alert.alert(t("review.discardTitle"), t("review.discardMessage"), [
        { text: t("review.keepEditing"), style: "cancel" },
        { text: t("review.discardAction"), style: "destructive", onPress: onClose },
      ]);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.kvContainer}
        >
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />

            <Text size="md" weight="semibold" style={[styles.title, isRTL && styles.textRTL]}>
              {t("profile.editProfile")}
            </Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.fields}
            >
              {/* Display name */}
              <View style={styles.field}>
                <Text size="sm" weight="semibold" secondary style={isRTL ? styles.textRTL : undefined}>
                  {t("profile.displayName")}
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.inputRTL]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  maxLength={50}
                  placeholder={t("profile.displayName")}
                  placeholderTextColor={Colors.textMuted}
                  textAlign={isRTL ? "right" : "left"}
                  autoCapitalize="words"
                />
              </View>

              {/* Bio */}
              <View style={styles.field}>
                <Text size="sm" weight="semibold" secondary style={isRTL ? styles.textRTL : undefined}>
                  {t("profile.bio")}
                </Text>
                <TextInput
                  style={[styles.input, styles.bioInput, isRTL && styles.inputRTL]}
                  value={bio}
                  onChangeText={setBio}
                  maxLength={200}
                  placeholder={t("profile.bioPlaceholder")}
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                  textAlign={isRTL ? "right" : "left"}
                />
                <Text size="xs" muted style={[styles.charCount, isRTL && styles.charCountRTL]}>
                  {bio.length}/200
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveBtn, !isDirty && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!isDirty || updateProfile.isPending}
              activeOpacity={0.8}
            >
              {updateProfile.isPending ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Text size="base" weight="semibold" style={styles.saveBtnText}>
                  {t("profile.saveChanges")}
                </Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
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
  kvContainer: { justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing["3xl"],
    paddingTop: Spacing.md,
    gap: Spacing.md,
    maxHeight: "85%",
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
  textRTL: { textAlign: "right" },
  fields: { gap: Spacing.md },
  field: { gap: Spacing.xs },
  input: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  inputRTL: { textAlign: "right" },
  bioInput: { minHeight: 80, textAlignVertical: "top" },
  charCount: { textAlign: "right" },
  charCountRTL: { textAlign: "left" },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  saveBtnDisabled: { opacity: 0.35 },
  saveBtnText: { color: Colors.textInverse },
});
