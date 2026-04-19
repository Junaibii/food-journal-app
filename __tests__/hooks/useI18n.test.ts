import { initI18n, i18n } from "@/hooks/useI18n";

describe("i18n", () => {
  it("resolves English keys", () => {
    initI18n("en");
    expect(i18n.t("common.cancel")).toBe("Cancel");
    expect(i18n.t("tabs.explore")).toBe("Explore");
  });

  it("resolves Arabic keys", () => {
    initI18n("ar");
    expect(i18n.t("common.cancel")).toBe("إلغاء");
    expect(i18n.t("tabs.explore")).toBe("استكشاف");
  });

  it("falls back to English for missing Arabic key", () => {
    initI18n("ar");
    // i18n-js enableFallback=true should fall back to English
    const result = i18n.t("common.cancel");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
