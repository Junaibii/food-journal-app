/**
 * Photo attacher — lets users pick up to `maxPhotos` images from gallery or camera.
 * Displays thumbnails with a remove button and optional caption field.
 */
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import type { LocalPhoto } from "@/stores/compose";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  photos: LocalPhoto[];
  onAdd: (photo: LocalPhoto) => void;
  onRemove: (uri: string) => void;
  onCaptionChange: (uri: string, caption: string) => void;
  maxPhotos?: number;
}

const THUMB = 90;

export function PhotoAttacher({
  photos,
  onAdd,
  onRemove,
  onCaptionChange,
  maxPhotos = 3,
}: Props) {
  const { isRTL } = useI18n();
  const canAdd = photos.length < maxPhotos;

  const normaliseMimeType = (type: string | undefined): LocalPhoto["mimeType"] => {
    if (!type) return "image/jpeg";
    if (type.includes("png")) return "image/png";
    if (type.includes("webp")) return "image/webp";
    if (type.includes("heic") || type.includes("heif")) return "image/heic";
    return "image/jpeg";
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo library access in Settings.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxPhotos - photos.length,
      quality: 0.85,
    });
    if (!result.canceled) {
      result.assets.forEach((asset) =>
        onAdd({
          uri: asset.uri,
          mimeType: normaliseMimeType(asset.mimeType),
          width: asset.width,
          height: asset.height,
        }),
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow camera access in Settings.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      onAdd({
        uri: asset.uri,
        mimeType: normaliseMimeType(asset.mimeType),
        width: asset.width,
        height: asset.height,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const showPicker = () => {
    Alert.alert("Add Photo", undefined, [
      { text: "Camera", onPress: pickFromCamera },
      { text: "Photo Library", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text size="sm" weight="semibold" secondary style={styles.label}>
        PHOTOS ({photos.length}/{maxPhotos})
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: isRTL ? "row-reverse" : "row", gap: Spacing.xs }}
      >
        {canAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={showPicker}>
            <Ionicons name="camera-outline" size={22} color={Colors.textMuted} />
            <Text size="xs" muted style={{ marginTop: 4 }}>Add</Text>
          </TouchableOpacity>
        )}
        {photos.map((photo) => (
          <View key={photo.uri} style={styles.thumb}>
            <Image source={{ uri: photo.uri }} style={styles.thumbImg} contentFit="cover" />
            <TouchableOpacity
              style={[styles.removeBtn, isRTL && styles.removeBtnRTL]}
              onPress={() => {
                onRemove(photo.uri);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name="close-circle" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {photos.map((photo) => (
        <TextInput
          key={`caption_${photo.uri}`}
          style={[styles.captionInput, isRTL && styles.captionInputRTL]}
          placeholder="Add a caption…"
          placeholderTextColor={Colors.textMuted}
          value={photo.caption ?? ""}
          onChangeText={(t) => onCaptionChange(photo.uri, t)}
          maxLength={200}
          textAlign={isRTL ? "right" : "left"}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  label: { letterSpacing: 0.8 },
  addBtn: {
    width: THUMB,
    height: THUMB,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    backgroundColor: Colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: Radii.md,
    overflow: "hidden",
    position: "relative",
  },
  thumbImg: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 3,
    right: 3,
  },
  removeBtnRTL: {
    right: undefined,
    left: 3,
  },
  captionInput: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
  },
  captionInputRTL: {
    textAlign: "right",
  },
});
