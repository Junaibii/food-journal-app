import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Food Journal",
  slug: "the-food-journal",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0D0D0D",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "ae.foodjournal.app",
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Food Journal uses your location to show nearby restaurants.",
      NSCameraUsageDescription:
        "Food Journal uses your camera to add photos to your reviews.",
      NSPhotoLibraryUsageDescription:
        "Food Journal accesses your photo library to attach images to reviews.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "ae.foodjournal.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0D0D0D",
    },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY,
      },
    },
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "CAMERA",
      "READ_MEDIA_IMAGES",
    ],
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
    "expo-localization",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0D0D0D",
        image: "./assets/splash.png",
      },
    ],
  ],
  scheme: "foodjournal",
  extra: {
    eas: {
      projectId: "e8da44bd-e0c7-4aca-96bb-3fd678508325",
    },
  },
};

export default config;
