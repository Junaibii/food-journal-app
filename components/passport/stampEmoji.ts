import type { StampDefinition } from "@/types";

const CUISINE_EMOJI: Record<string, string> = {
  emirati: "🇦🇪",
  arabic: "🫕",
  levantine: "🥙",
  lebanese: "🥙",
  turkish: "🥙",
  persian: "🫖",
  moroccan: "🫖",
  ethiopian: "🍲",
  indian: "🍛",
  pakistani: "🍛",
  japanese: "🍣",
  chinese: "🥢",
  thai: "🍜",
  vietnamese: "🍜",
  southeast_asian: "🍜",
  italian: "🍝",
  french: "🥐",
  greek: "🫒",
  american: "🍔",
  british: "☕",
  mexican: "🌮",
  filipino: "🍚",
};

const MILESTONE_EMOJI: Record<string, string> = {
  first_review: "🎉",
  reviews_5: "📝",
  reviews_10: "🔟",
  reviews_25: "✨",
  reviews_50: "🏆",
  reviews_100: "💎",
  first_photo: "📸",
};

export function stampEmoji(stamp: StampDefinition): string {
  if (stamp.is_founding) return "⭐";
  if (stamp.category === "milestone") {
    return MILESTONE_EMOJI[stamp.slug] ?? "🏅";
  }
  if (stamp.category === "neighborhood") return "🗺️";
  if (stamp.category === "cuisine") {
    const key = Object.keys(CUISINE_EMOJI).find((k) => stamp.slug.includes(k));
    return key ? CUISINE_EMOJI[key] : "🍽️";
  }
  return "🏅";
}
