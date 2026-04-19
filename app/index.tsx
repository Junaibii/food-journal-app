/**
 * Root index — redirects based on auth state once loading is complete.
 * This prevents the /--/ unmatched route error.
 */
import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  // While splash / auth restoration is in progress, render nothing
  // (the RootLayout handles SplashScreen.hideAsync).
  if (isLoading) return null;

  if (user) {
    return <Redirect href="/(tabs)/explore" />;
  }

  return <Redirect href="/(auth)" />;
}
