import React, { memo } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
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

  if (!isUnlocked) {
    return (
      <TouchableOpacity style={styles.locked} onPress={onPress} activeOpacity={0.6}>
        <Text style={styles.lockedEmoji}>{stampEmoji(stamp)}</Text>
        <Text size="xs" style={styles.lockedLabel} numberOfLines={2}>{name}</Text>
        <Text style={styles.lockIcon}>🔒</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.unlocked} onPress={onPress} activeOpacity={0.75}>
      {/* Gold glow ring */}
      <View style={styles.emojiRing}>
        <Text style={styles.unlockedEmoji}>{stampEmoji(stamp)}</Text>
      </View>
      <Text size="xs" weight="semibold" style={styles.unlockedLabel} numberOfLines={2}>
        {name}
      </Text>
      {stamp.tier > 1 && (
        <View style={styles.tierRow}>
          {Array.from({ length: stamp.tier }).map((_, i) => (
            <View key={i} style={styles.tierDot} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
});

const CARD_SIZE = 90;

const styles = StyleSheet.create({
  // Locked — small, muted, dashed border
  locked: {
    width: CARD_SIZE,
    minHeight: CARD_SIZE + 20,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.sm,
    gap: 4,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.borderSubtle,
    borderStyle: "dashed",
    backgroundColor: Colors.bgSurface,
    opacity: 0.5,
  },
  lockedEmoji: { fontSize: 24, opacity: 0.35, lineHeight: 30 },
  lockedLabel: {
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 15,
  },
  lockIcon: { fontSize: 10, marginTop: 2 },

  // Unlocked — gold border, warm bg, full opacity
  unlocked: {
    width: CARD_SIZE,
    minHeight: CARD_SIZE + 20,
    alignItems: "center",
    padding: Spacing.sm,
    gap: 6,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.accentGoldBorder,
    backgroundColor: Colors.accentGoldBg,
    shadowColor: Colors.accentGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(166,124,0,0.12)",
    borderWidth: 1,
    borderColor: Colors.accentGoldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockedEmoji: { fontSize: 26, lineHeight: 32 },
  unlockedLabel: {
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 15,
  },
  tierRow: { flexDirection: "row", gap: 3 },
  tierDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accentGold,
  },
});
