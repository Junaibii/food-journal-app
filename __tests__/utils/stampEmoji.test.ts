import { stampEmoji } from "@/components/passport/stampEmoji";
import type { StampDefinition } from "@/types";

function makeStamp(overrides: Partial<StampDefinition>): StampDefinition {
  return {
    id: "test",
    slug: "test_slug",
    name_en: "Test",
    name_ar: null,
    description_en: null,
    description_ar: null,
    icon_url: null,
    category: "milestone",
    tier: 1,
    is_founding: false,
    ...overrides,
  };
}

describe("stampEmoji", () => {
  it("returns ⭐ for founding stamps", () => {
    expect(stampEmoji(makeStamp({ is_founding: true }))).toBe("⭐");
  });

  it("returns 🗺️ for neighborhood stamps", () => {
    expect(stampEmoji(makeStamp({ category: "neighborhood" }))).toBe("🗺️");
  });

  it("returns 🎉 for first_review milestone", () => {
    expect(stampEmoji(makeStamp({ slug: "first_review", category: "milestone" }))).toBe("🎉");
  });

  it("returns 🏅 for unknown milestone", () => {
    expect(stampEmoji(makeStamp({ slug: "unknown_milestone", category: "milestone" }))).toBe("🏅");
  });

  it("returns cuisine emoji for known cuisine slug", () => {
    expect(stampEmoji(makeStamp({ slug: "cuisine_japanese", category: "cuisine" }))).toBe("🍣");
    expect(stampEmoji(makeStamp({ slug: "cuisine_emirati", category: "cuisine" }))).toBe("🇦🇪");
    expect(stampEmoji(makeStamp({ slug: "cuisine_italian", category: "cuisine" }))).toBe("🍝");
  });

  it("returns 🍽️ for unknown cuisine", () => {
    expect(stampEmoji(makeStamp({ slug: "cuisine_unknown", category: "cuisine" }))).toBe("🍽️");
  });
});
