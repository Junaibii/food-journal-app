import React from "react";
import {
  Modal,
  Pressable,
  View,
  StyleSheet,
} from "react-native";
import { format } from "date-fns";
import type { StampDefinition, UserStamp } from "@/types";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { stampEmoji } from "./stampEmoji";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  stamp: StampDefinition | null;
  userStamp: UserStamp | null; // null = locked
  onClose: () => void;
}

export function StampDetailSheet({ stamp, userStamp, onClose }: Props) {
  const { t, locale } = useI18n();

  if (!stamp) return null;

  const name = locale === "ar" && stamp.name_ar ? stamp.name_ar : stamp.name_en;
  const description =
    locale === "ar" && stamp.description_ar
      ? stamp.description_ar
      : stamp.description_en;
  const isUnlocked = !!userStamp;
  const unlockedDate = userStamp
    ? format(new Date(userStamp.unlocked_at), "MMM d, yyyy")
    : null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Emoji */}
          <View style={[styles.emojiCircle, isUnlocked && styles.emojiCircleUnlocked]}>
            <Text style={styles.emoji}>{stampEmoji(stamp)}</Text>
          </View>

          {/* Name */}
          <Text size="xl" weight="bold" style={styles.name}>
            {name}
          </Text>

          {/* Status chip */}
          <View style={[styles.statusChip, isUnlocked ? styles.chipUnlocked : styles.chipLocked]}>
            <Text
              size="xs"
              weight="semibold"
              style={isUnlocked ? styles.chipTextUnlocked : styles.chipTextLocked}
            >
              {isUnlocked ? t("passport.unlocked") : t("passport.locked")}
            </Text>
          </View>

          {/* Description */}
          {description ? (
            <Text secondary style={styles.description}>
              {description}
            </Text>
          ) : null}

          {/* Unlock date */}
          {unlockedDate ? (
            <Text size="sm" style={styles.date} secondary>
              {t("passport.earned")} {unlockedDate}
            </Text>
          ) : null}

          {/* Tier dots */}
          {stamp.tier > 0 && (
            <View style={styles.tierRow}>
              {Array.from({ length: 3 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.tierSegment,
                    i < stamp.tier && styles.tierSegmentFilled,
                  ]}
                />
              ))}
            </View>
          )}
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
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing["3xl"],
    paddingTop: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  emojiCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.bgSurface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiCircleUnlocked: {
    borderColor: Colors.accentGold,
    backgroundColor: Colors.accentGoldBg,
  },
  emoji: {
    fontSize: 44,
    lineHeight: 52,
  },
  name: {
    textAlign: "center",
  },
  statusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
  },
  chipUnlocked: {
    backgroundColor: Colors.accentGoldBg,
  },
  chipLocked: {
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipTextUnlocked: {
    color: Colors.accentGold,
  },
  chipTextLocked: {
    color: Colors.textMuted,
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
  },
  date: {
    textAlign: "center",
  },
  tierRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  tierSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  tierSegmentFilled: {
    backgroundColor: Colors.accentGold,
  },
});
