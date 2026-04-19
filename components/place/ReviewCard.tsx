import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { Review } from "@/types";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { RatingStars } from "@/components/ui/RatingStars";
import { ReportSheet, type ReportTarget } from "@/components/review/ReportSheet";
import { reportReview } from "@/services/reviews";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  review: Review;
}

export function ReviewCard({ review }: Props) {
  const { isRTL } = useI18n();
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  const user = review.user;
  const initials = user?.display_name
    ? user.display_name.slice(0, 2).toUpperCase()
    : (user?.username.slice(0, 2).toUpperCase() ?? "?");

  const handleReport = async (target: ReportTarget, reason: string) => {
    if (target.kind === "review") {
      await reportReview(target.id, reason);
    }
  };

  return (
    <>
      <View style={[styles.card, isRTL && styles.cardRTL]}>
        {/* User row */}
        <View style={[styles.userRow, isRTL && styles.rowRTL]}>
          <View style={styles.avatar}>
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            ) : (
              <Text size="sm" weight="semibold" style={{ color: Colors.olive }}>
                {initials}
              </Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text size="sm" weight="semibold">
              {user?.display_name ?? user?.username ?? "Anonymous"}
            </Text>
            {review.visit_date && (
              <Text size="xs" muted>{review.visit_date}</Text>
            )}
          </View>
          <View style={[styles.metaRow, isRTL && styles.rowRTL]}>
            {review.rating && <RatingStars rating={review.rating} size="sm" />}
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => setReportTarget({ kind: "review", id: review.id })}
              hitSlop={8}
            >
              <Ionicons name="flag-outline" size={15} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {review.body ? (
          <Text
            size="sm"
            secondary
            style={[styles.body, isRTL && styles.textRTL]}
          >
            {review.body}
          </Text>
        ) : null}
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
  card: {
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  cardRTL: {},
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rowRTL: { flexDirection: "row-reverse" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  userInfo: { flex: 1 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  reportBtn: {
    padding: Spacing.xs,
  },
  body: { lineHeight: 20 },
  textRTL: { textAlign: "right" },
});
