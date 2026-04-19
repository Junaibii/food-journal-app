export interface CuisineOption {
  tag: string;
  label_en: string;
  label_ar: string;
  emoji: string;
}

export const CUISINE_OPTIONS: CuisineOption[] = [
  { tag: "emirati", label_en: "Emirati", label_ar: "إماراتي", emoji: "🇦🇪" },
  { tag: "arabic", label_en: "Arabic", label_ar: "عربي", emoji: "🥙" },
  { tag: "lebanese", label_en: "Lebanese", label_ar: "لبناني", emoji: "🫔" },
  { tag: "indian", label_en: "Indian", label_ar: "هندي", emoji: "🍛" },
  { tag: "pakistani", label_en: "Pakistani", label_ar: "باكستاني", emoji: "🍲" },
  { tag: "japanese", label_en: "Japanese", label_ar: "ياباني", emoji: "🍣" },
  { tag: "chinese", label_en: "Chinese", label_ar: "صيني", emoji: "🥟" },
  { tag: "italian", label_en: "Italian", label_ar: "إيطالي", emoji: "🍝" },
  { tag: "american", label_en: "American", label_ar: "أمريكي", emoji: "🍔" },
  { tag: "thai", label_en: "Thai", label_ar: "تايلاندي", emoji: "🍜" },
  { tag: "mediterranean", label_en: "Mediterranean", label_ar: "متوسطي", emoji: "🫒" },
  { tag: "persian", label_en: "Persian", label_ar: "إيراني", emoji: "🍖" },
  { tag: "turkish", label_en: "Turkish", label_ar: "تركي", emoji: "🥩" },
  { tag: "seafood", label_en: "Seafood", label_ar: "مأكولات بحرية", emoji: "🦞" },
  { tag: "cafe", label_en: "Café", label_ar: "مقهى", emoji: "☕" },
  { tag: "brunch", label_en: "Brunch", label_ar: "برانش", emoji: "🥞" },
  { tag: "korean", label_en: "Korean", label_ar: "كوري", emoji: "🫕" },
  { tag: "mexican", label_en: "Mexican", label_ar: "مكسيكي", emoji: "🌮" },
  { tag: "french", label_en: "French", label_ar: "فرنسي", emoji: "🥐" },
  { tag: "desserts", label_en: "Desserts", label_ar: "حلويات", emoji: "🍰" },
];

export const PRICE_TIERS = [
  { value: 1, label_en: "Budget", label_ar: "اقتصادي", symbol: "＄" },
  { value: 2, label_en: "Mid-range", label_ar: "متوسط", symbol: "＄＄" },
  { value: 3, label_en: "Upscale", label_ar: "راقي", symbol: "＄＄＄" },
  { value: 4, label_en: "Fine Dining", label_ar: "فاخر", symbol: "＄＄＄＄" },
];

export const CITY_OPTIONS = [
  { value: "dubai" as const, label_en: "Dubai", label_ar: "دبي" },
  { value: "abu_dhabi" as const, label_en: "Abu Dhabi", label_ar: "أبوظبي" },
];
