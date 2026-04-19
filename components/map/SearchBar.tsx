import React, { useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFilterPress: () => void;
  activeFilterCount: number;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  onFilterPress,
  activeFilterCount,
}: Props) {
  const { t, isRTL } = useI18n();
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="search"
          size={16}
          color={Colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={[styles.input, isRTL && styles.inputRTL]}
          placeholder={t("explore.searchPlaceholder")}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          clearButtonMode="never"
          autoCorrect={false}
          textAlign={isRTL ? "right" : "left"}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={8} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress}>
        <Ionicons name="options-outline" size={18} color={Colors.textPrimary} />
        {activeFilterCount > 0 && (
          <View style={styles.filterBadge}>
            <View style={styles.filterDot} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    height: 42,
  },
  searchIcon: {
    marginEnd: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    ...Platform.select({ android: { paddingVertical: 0 } }),
  },
  inputRTL: {
    writingDirection: "rtl",
  },
  clearBtn: {
    padding: Spacing.xs,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  filterDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.accentGold,
  },
});
