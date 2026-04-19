import { I18n } from "i18n-js";
import { I18nManager } from "react-native";
import * as ExpoLocalization from "expo-localization";

import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

const i18n = new I18n({ en, ar });

i18n.enableFallback = true;
i18n.defaultLocale = "en";

export function initI18n(locale: "en" | "ar") {
  i18n.locale = locale;
  const shouldBeRTL = locale === "ar";
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    // App must restart for RTL change to take full effect
  }
}

export function useI18n() {
  return {
    t: (key: string, options?: object) => i18n.t(key, options),
    locale: i18n.locale as "en" | "ar",
    isRTL: i18n.locale === "ar",
  };
}

export { i18n };
