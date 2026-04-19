/**
 * Inline place search — debounced, shows results in a list below the input.
 * Used in step 1 of the review compose flow.
 */
import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { searchPlaces } from "@/services/places";
import type { Place } from "@/types";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { CUISINE_OPTIONS } from "@/constants/cuisines";
import { useI18n } from "@/hooks/useI18n";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  onSelect: (place: Place) => void;
}

export function PlaceSearchInput({ onSelect }: Props) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);

  const { data, isFetching } = useQuery({
    queryKey: ["places", "search", debouncedQuery],
    queryFn: () => searchPlaces({ q: debouncedQuery, limit: 12 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  const places = data?.data ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={16} color={Colors.textMuted} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={t("explore.searchPlaceholder")}
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoFocus
        />
        {isFetching && <ActivityIndicator size="small" color={Colors.accent} />}
        {query.length > 0 && !isFetching && (
          <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {places.length > 0 && (
        <FlatList
          data={places}
          keyExtractor={(p) => p.id}
          keyboardShouldPersistTaps="handled"
          style={styles.results}
          renderItem={({ item }) => {
            const emoji =
              CUISINE_OPTIONS.find((c) => item.cuisine_tags.includes(c.tag))?.emoji ?? "🍽️";
            const name =
              locale === "ar" && item.name_ar ? item.name_ar : item.name_en;
            return (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{emoji}</Text>
                <View style={styles.resultInfo}>
                  <Text size="base" weight="medium" numberOfLines={1}>
                    {name}
                  </Text>
                  {item.neighborhood && (
                    <Text size="sm" secondary numberOfLines={1}>
                      {item.neighborhood}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      )}

      {debouncedQuery.length >= 2 && places.length === 0 && !isFetching && (
        <Text secondary style={styles.empty}>{t("common.noResults")}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    height: 48,
    gap: Spacing.xs,
  },
  icon: { flexShrink: 0 },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
  },
  results: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 320,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  emoji: { fontSize: 22, width: 30, textAlign: "center" },
  resultInfo: { flex: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginStart: 46 },
  empty: { textAlign: "center", padding: Spacing.lg },
});
