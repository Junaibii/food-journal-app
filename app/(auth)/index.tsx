import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing, Radii } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { initI18n } from "@/hooks/useI18n";

const FOOD_GRID = ["🥙", "☕", "🍣", "🦞", "🍔", "🍛", "🥐", "🍰", "🫔"];

export default function OnboardingScreen() {
  const router = useRouter();
  const [locale, setLocale] = React.useState<"en" | "ar">("en");

  const handleContinue = () => {
    initI18n(locale);
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      {/* Hero area */}
      <View style={styles.hero}>
        {/* Food emoji mosaic */}
        <View style={styles.mosaic}>
          {FOOD_GRID.map((emoji, i) => (
            <View key={i} style={[styles.mosaicCell, { opacity: 0.55 + (i % 3) * 0.15 }]}>
              <Text style={styles.mosaicEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>

        {/* Brand headline over the mosaic */}
        <View style={styles.brandOverlay}>
          <Text serif size="xs" style={styles.eyebrow}>
            {locale === "ar" ? "الإمارات" : "THE UAE"}
          </Text>
          <Text serif size="2xl" style={styles.brandTitle}>
            {locale === "ar" ? "يوميّات\nالطعام" : "Food\nJournal"}
          </Text>
          <View style={styles.brandLine} />
          <Text size="sm" style={styles.brandTagline}>
            {locale === "ar"
              ? "اكتشف · دوّن · شارك"
              : "Discover · Log · Share"}
          </Text>
        </View>
      </View>

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Language toggle */}
        <Text size="xs" style={styles.langLabel}>
          {locale === "ar" ? "اختر لغتك" : "Choose your language"}
        </Text>
        <View style={styles.langRow}>
          {(["en", "ar"] as const).map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.langBtn, locale === l && styles.langBtnActive]}
              onPress={() => setLocale(l)}
              activeOpacity={0.75}
            >
              <Text
                size="base"
                weight={locale === l ? "semibold" : "regular"}
                style={locale === l ? styles.langTextActive : styles.langText}
              >
                {l === "en" ? "English" : "العربية"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          label={locale === "ar" ? "ابدأ الآن" : "Get started"}
          onPress={handleContinue}
          style={styles.cta}
        />

        <Text size="xs" style={styles.legalNote}>
          {locale === "ar"
            ? "للمقيمين في الإمارات العربية المتحدة"
            : "For residents & visitors across the UAE"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Hero
  hero: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  mosaic: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: Colors.olive,
  },
  mosaicCell: {
    width: "33.33%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  mosaicEmoji: { fontSize: 52 },
  brandOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 32, 16, 0.72)",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing["2xl"],
  },
  eyebrow: {
    color: Colors.accentGold,
    letterSpacing: 3,
    fontSize: 11,
  },
  brandTitle: {
    color: Colors.textInverse,
    textAlign: "center",
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  brandLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accentGold,
    borderRadius: 1,
    marginVertical: Spacing.xs,
  },
  brandTagline: {
    color: "rgba(247,243,236,0.7)",
    letterSpacing: 1.5,
    textAlign: "center",
  },

  // Bottom
  bottom: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    gap: Spacing.md,
    backgroundColor: Colors.bg,
  },
  langLabel: {
    color: Colors.textMuted,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  langRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  langBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
  },
  langBtnActive: {
    borderColor: Colors.accentGold,
    backgroundColor: Colors.accentGoldBg,
  },
  langText: { color: Colors.textSecondary },
  langTextActive: { color: Colors.accentGold },
  cta: { width: "100%" },
  legalNote: {
    color: Colors.textMuted,
    textAlign: "center",
  },
});
