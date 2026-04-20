import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { getLocales } from "expo-localization";
import { StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
} from "@expo-google-fonts/playfair-display";
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import { Colors } from "@/constants/theme";
import { initI18n } from "@/hooks/useI18n";
import { useAuthStore } from "@/stores/auth";
import { storage } from "@/services/storage";
import { getMe } from "@/services/users";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_500Medium,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  const setLoading = useAuthStore((s) => s.setLoading);
  const restoreAuth = useAuthStore((s) => s.restoreAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    async function boot() {
      try {
        const deviceLocale = getLocales()[0]?.languageCode ?? "en";
        initI18n(deviceLocale === "ar" ? "ar" : "en");
      } catch {
        initI18n("en");
      }

      try {
        const token = await storage.getToken();

        if (token) {
          // Inject token into the store so the API interceptor can use it
          // during the validation call, without triggering a SecureStore write.
          useAuthStore.setState({ token });

          const user = await getMe();
          restoreAuth(user, token);
        }
      } catch {
        // Token is expired, revoked, or the network is offline.
        // Clear the stale token and fall through to onboarding.
        clearAuth();
      } finally {
        setLoading(false);
        if (fontsLoaded) SplashScreen.hideAsync();
      }
    }

    boot();
  }, [setLoading, restoreAuth, clearAuth]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bg },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen
            name="place/[id]"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="review/compose"
            options={{
              headerShown: false,
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="user/[username]"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
