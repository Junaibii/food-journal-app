import React, { useState } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { Photo } from "@/types";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { ReportSheet, type ReportTarget } from "@/components/review/ReportSheet";
import { reportPhoto } from "@/services/photos";

const { width } = Dimensions.get("window");
const CELL = (width - Spacing.base * 2 - Spacing.xs * 2) / 3;

interface Props {
  photos: Photo[];
}

export function PhotoGrid({ photos }: Props) {
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  if (photos.length === 0) return null;

  const handleReport = async (target: ReportTarget, reason: string) => {
    if (target.kind === "photo") {
      await reportPhoto(target.id, reason);
    }
  };

  return (
    <>
      <View style={styles.grid}>
        {photos.slice(0, 9).map((photo, i) => (
          <View key={photo.id} style={styles.cell}>
            <Image
              source={{ uri: photo.cdn_url }}
              style={styles.image}
              contentFit="cover"
              recyclingKey={photo.id}
            />
            {photo.caption && i === 0 && (
              <View style={styles.captionOverlay}>
                <Text size="xs" numberOfLines={1} style={styles.caption}>
                  {photo.caption}
                </Text>
              </View>
            )}
            {/* Report button */}
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => setReportTarget({ kind: "photo", id: photo.id })}
              hitSlop={6}
            >
              <Ionicons name="flag" size={11} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <ReportSheet
        target={reportTarget}
        onReport={handleReport}
        onClose={() => setReportTarget(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: Radii.md,
    overflow: "hidden",
    backgroundColor: Colors.bgElevated,
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  captionOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgOverlay,
    padding: 4,
  },
  caption: { color: Colors.textPrimary },
  reportBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
});
