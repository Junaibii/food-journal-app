import React, { memo } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { StampDefinition } from "@/types";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { stampEmoji } from "./stampEmoji";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  stamp: StampDefinition;
  isUnlocked: boolean;
  onPress: () => void;
}

export const StampCard = memo(({ stamp, isUnlocked, onPress }: Props) => {
  const { locale } = useI18n();
  const name = locale === "ar" && stamp.name_ar ? stamp.name_ar : stamp.name_en;

  return (
    <TouchableOpacity
      style={[styles.card, isUnlocked && styles.cardUnlocked]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.emojiWrap}>
        <Text style={[styles.emoji, !isUnlocked && styles.emojiLocked]}>
          {stampEmoji(stamp)}
        </Text>
        {!isUnlocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
          </View>
        )}
      </View>
      <Text
        size="xs"
        weight={isUnlocked ? "semibold" : "regular"}
        style={[styles.label, !isUnlocked && styles.labelLocked]}
        numberOfLines={2}
      >
        {name}
      </Text>
      {isUnlocked && stamp.tier > 1 && (
        <View style={styles.tierDot}>
          {Array.from({ length: stamp.tier }).map((_, i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
});

const CARD_SIZE = 90;

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    minHeight: CARD_SIZE + 24,
    backgroundColor: Colors.bgSurface,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    padding: Spacing.sm,
    gap: 4,
    opacity: 0.45,
  },
  cardUnlocked: {
    borderColor: Colors.accentGoldBorder,
    backgroundColor: Colors.bgElevated,
    opacity: 1,
  },
  emojiWrap: {
    position: "relative",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 30,
    lineHeight: 36,
  },
  emojiLocked: {
    opacity: 0.4,
  },
  lockOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  label: {
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  labelLocked: {
    color: Colors.textMuted,
  },
  tierDot: {
    flexDirection: "row",
    gap: 3,
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accentGold,
  },
});
