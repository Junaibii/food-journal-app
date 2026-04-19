/**
 * Login screen
 */
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth";
import { login } from "@/services/auth";
import { useI18n } from "@/hooks/useI18n";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await login({ email: email.trim(), password });
      setAuth(user, token);
      router.replace("/(tabs)/explore");
    } catch (err: unknown) {
      Alert.alert(
        "Login failed",
        err instanceof Error ? err.message : "Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🍽️</Text>
          <Text size="2xl" weight="bold" style={styles.title}>
            Food Journal
          </Text>
          <Text secondary style={styles.tagline}>
            Sign in to your account
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text size="sm" weight="semibold" secondary>
              Email
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text size="sm" weight="semibold" secondary>
              Password
            </Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <Button
            label={loading ? "" : "Sign In"}
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text secondary size="sm">
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text size="sm" weight="semibold" color={Colors.accentGold}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.bg,
    padding: Spacing["2xl"],
    justifyContent: "center",
    gap: Spacing.xl,
  },
  hero: { alignItems: "center", gap: Spacing.sm },
  heroEmoji: { fontSize: 56 },
  title: { textAlign: "center" },
  tagline: { textAlign: "center" },
  form: { gap: Spacing.md },
  field: { gap: Spacing.xs },
  input: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  submitBtn: { marginTop: Spacing.sm },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
