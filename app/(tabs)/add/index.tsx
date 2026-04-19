/**
 * Step 1 of the review compose flow: search for a place.
 * Navigates to /review/compose?placeId=... on selection.
 */
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { PlaceSearchInput } from "@/components/review/PlaceSearchInput";
import { useComposeStore } from "@/stores/compose";
import type { Place } from "@/types";
import { useI18n } from "@/hooks/useI18n";

export default function AddReviewStep1() {
  const { t } = useI18n();
  const router = useRouter();
  const setPlace = useComposeStore((s) => s.setPlace);
  const reset = useComposeStore((s) => s.reset);

  const handleSelect = (place: Place) => {
    reset();
    setPlace(place);
    router.push(`/review/compose?placeId=${place.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text size="lg" weight="bold">{t("place.writeReview")}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text secondary style={styles.hint}>Which place are you reviewing?</Text>
        <PlaceSearchInput onSelect={handleSelect} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  body: { flex: 1, padding: Spacing.base, gap: Spacing.md },
  hint: { marginBottom: Spacing.xs },
});
