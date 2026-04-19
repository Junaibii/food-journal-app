/**
 * Language select + onboarding screen.
 * Shown only on first launch.
 */
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { initI18n, useI18n } from "@/hooks/useI18n";
import { useMapStore } from "@/stores/map";

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const setCity = useMapStore((s) => s.setCity);
  const [locale, setLocale] = React.useState<"en" | "ar">("en");

  const handleContinue = () => {
    initI18n(locale);
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🗺️</Text>
        <Text size="2xl" weight="bold" style={styles.title}>
          {locale === "ar" ? "يوميات الطعام" : "Food Journal"}
        </Text>
        <Text secondary style={styles.tagline}>
          {locale === "ar"
            ? "اكتشف أفضل المطاعم في الإمارات"
            : "Discover the best food in the UAE"}
        </Text>
      </View>

      <View style={styles.langPicker}>
        <Text size="sm" secondary style={{ marginBottom: Spacing.sm }}>
          {locale === "ar" ? "اختر لغتك" : "Select your language"}
        </Text>
        <View style={styles.langRow}>
          {(["en", "ar"] as const).map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.langBtn, locale === l && styles.langBtnActive]}
              onPress={() => setLocale(l)}
            >
              <Text
                size="base"
                weight={locale === l ? "semibold" : "regular"}
                color={locale === l ? Colors.accentGold : Colors.textSecondary}
              >
                {l === "en" ? "English" : "العربية"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button label={locale === "ar" ? "متابعة" : "Continue"} onPress={handleContinue} style={styles.cta} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    padding: Spacing["2xl"],
    justifyContent: "space-between",
  },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.md },
  heroEmoji: { fontSize: 72 },
  title: { textAlign: "center" },
  tagline: { textAlign: "center" },
  langPicker: { alignItems: "center", marginBottom: Spacing.xl },
  langRow: { flexDirection: "row", gap: Spacing.sm },
  langBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  langBtnActive: { borderColor: Colors.accentGold, backgroundColor: Colors.accentGoldBg },
  cta: { width: "100%" },
});
