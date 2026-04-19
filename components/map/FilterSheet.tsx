import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { CITY_OPTIONS, CUISINE_OPTIONS, PRICE_TIERS } from "@/constants/cuisines";
import { useI18n } from "@/hooks/useI18n";
import type { PlaceSearchParams } from "@/types";

interface Props {
  filters: Omit<PlaceSearchParams, "lat" | "lng" | "page" | "limit">;
  onApply: (filters: Omit<PlaceSearchParams, "lat" | "lng" | "page" | "limit">) => void;
  onClose: () => void;
  visible: boolean;
}

export function FilterSheet({ filters, onApply, onClose, visible }: Props) {
  const { t, locale } = useI18n();
  const [draft, setDraft] = React.useState(filters);

  React.useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const toggle = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setDraft((d) => ({ ...d, [key]: d[key] === value ? undefined : value }));
  };

  const activeCount = Object.values(draft).filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <Text size="md" weight="semibold">{t("explore.filters")}</Text>
          <TouchableOpacity onPress={() => setDraft({})}>
            <Text size="sm" color={Colors.accentGold}>{t("explore.clearFilters")}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <SectionLabel label={t("explore.city")} />
          <ChipRow>
            {CITY_OPTIONS.map((c) => (
              <Chip
                key={c.value}
                label={locale === "ar" ? c.label_ar : c.label_en}
                selected={draft.city === c.value}
                onPress={() => toggle("city", c.value)}
              />
            ))}
          </ChipRow>

          <SectionLabel label={t("explore.cuisine")} />
          <ChipRow wrap>
            {CUISINE_OPTIONS.map((c) => (
              <Chip
                key={c.tag}
                label={`${c.emoji} ${locale === "ar" ? c.label_ar : c.label_en}`}
                selected={draft.cuisine === c.tag}
                onPress={() => toggle("cuisine", c.tag)}
              />
            ))}
          </ChipRow>

          <SectionLabel label={t("explore.price")} />
          <ChipRow>
            {PRICE_TIERS.map((p) => (
              <Chip
                key={p.value}
                label={p.symbol}
                selected={draft.price_tier === p.value}
                onPress={() => toggle("price_tier", p.value)}
              />
            ))}
          </ChipRow>

          <View style={{ height: Spacing["3xl"] }} />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={t("explore.applyFilters") + (activeCount > 0 ? ` (${activeCount})` : "")}
            onPress={() => { onApply(draft); onClose(); }}
            style={styles.applyBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text size="sm" weight="semibold" secondary style={{ marginBottom: Spacing.sm, marginTop: Spacing.lg }}>
      {label.toUpperCase()}
    </Text>
  );
}

function ChipRow({ children, wrap }: { children: React.ReactNode; wrap?: boolean }) {
  return (
    <View style={[styles.chipRow, wrap && styles.chipRowWrap]}>{children}</View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        size="sm"
        weight={selected ? "semibold" : "regular"}
        color={selected ? Colors.accentGold : Colors.textSecondary}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    paddingHorizontal: Spacing.base,
    paddingBottom: Platform.OS === "ios" ? Spacing["2xl"] : Spacing.base,
  },
  handleBar: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scroll: { flex: 1 },
  chipRow: { flexDirection: "row", gap: Spacing.xs },
  chipRowWrap: { flexWrap: "wrap" },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  chipSelected: {
    borderColor: Colors.accentGold,
    backgroundColor: Colors.accentGoldBg,
  },
  footer: {
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyBtn: { width: "100%" },
});
