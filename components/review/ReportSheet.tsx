import React, { useState } from "react";
import {
  Modal,
  Pressable,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { useI18n } from "@/hooks/useI18n";

export type ReportTarget =
  | { kind: "review"; id: string }
  | { kind: "photo"; id: string };

interface Props {
  target: ReportTarget | null;
  onReport: (target: ReportTarget, reason: string) => Promise<void>;
  onClose: () => void;
}

const REASON_KEYS = [
  "spam",
  "inappropriate",
  "inaccurate",
  "harassment",
  "other",
] as const;

export function ReportSheet({ target, onReport, onClose }: Props) {
  const { t, isRTL } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!target || !selected) return;
    setSubmitting(true);
    try {
      await onReport(target, selected);
      Alert.alert("", t("review.reportSuccess" as any));
      setSelected(null);
      onClose();
    } catch {
      Alert.alert("Error", t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    <Modal visible={!!target} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <Text size="md" weight="semibold" style={[styles.title, isRTL && styles.textRTL]}>
            {t("review.reportTitle" as any)}
          </Text>

          <View style={styles.reasons}>
            {REASON_KEYS.map((key) => {
              const isSelected = selected === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.reasonRow, isSelected && styles.reasonRowSelected, isRTL && styles.rowRTL]}
                  onPress={() => setSelected(key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text
                    size="base"
                    style={[styles.reasonText, isRTL && styles.textRTL]}
                  >
                    {t(`review.reportReasons.${key}` as any)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !selected && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!selected || submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : (
              <Text size="base" weight="semibold" style={styles.submitLabel}>
                {t("review.report" as any)}
              </Text>
            )}
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
    backgroundColor: Colors.bgSurface,
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
  title: { marginBottom: Spacing.xs },
  reasons: { gap: Spacing.xs },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  reasonRowSelected: {
    borderColor: Colors.accentGold,
    backgroundColor: Colors.accentGoldBg,
  },
  rowRTL: { flexDirection: "row-reverse" },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioSelected: { borderColor: Colors.accentGold },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentGold,
  },
  reasonText: { flex: 1 },
  textRTL: { textAlign: "right" },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  submitBtnDisabled: { opacity: 0.35 },
  submitLabel: { color: Colors.textInverse },
});
