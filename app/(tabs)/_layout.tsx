import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text as RNText } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { useI18n } from "@/hooks/useI18n";

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={tabLabelStyles.wrap}>
      <View style={[tabLabelStyles.pip, focused && tabLabelStyles.pipActive]} />
      <RNText style={[tabLabelStyles.text, focused ? tabLabelStyles.textActive : tabLabelStyles.textInactive]}>
        {label}
      </RNText>
    </View>
  );
}

const tabLabelStyles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 3 },
  pip: { width: 18, height: 3, borderRadius: 100, backgroundColor: "transparent" },
  pipActive: { backgroundColor: Colors.accentGold },
  text: { fontSize: Typography.sizes.xs, fontFamily: Typography.fontSans },
  textActive: { color: Colors.textPrimary },
  textInactive: { color: Colors.textMuted },
});

function FABTabButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name="add" size={28} color={Colors.textInverse} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgSurface,
          borderTopColor: Colors.borderSubtle,
          borderTopWidth: 0.5,
          height: 80,
          paddingBottom: 20,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="explore/index"
        options={{
          title: t("tabs.explore"),
          tabBarIcon: () => null,
          tabBarLabel: ({ focused }) => <TabLabel label={t("tabs.explore")} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="discover/index"
        options={{
          title: t("tabs.discover"),
          tabBarIcon: () => null,
          tabBarLabel: ({ focused }) => <TabLabel label={t("tabs.discover")} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add/index"
        options={{
          title: "",
          tabBarIcon: () => null,
          tabBarButton: () => (
            <FABTabButton onPress={() => router.push("/(tabs)/add")} />
          ),
        }}
      />
      <Tabs.Screen
        name="passport/index"
        options={{
          title: t("tabs.passport"),
          tabBarIcon: () => null,
          tabBarLabel: ({ focused }) => <TabLabel label={t("tabs.passport")} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: () => null,
          tabBarLabel: ({ focused }) => <TabLabel label={t("tabs.profile")} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: Radii.pill,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
