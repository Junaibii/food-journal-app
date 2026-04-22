export interface User {
  id: string;
  email?: string | null;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  locale: "en" | "ar";
  is_founding_contributor: boolean;
  created_at: string;
}

export interface UserProfile extends User {
  review_count: number;
  stamp_count: number;
  save_count: number;
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

export interface Place {
  id: string;
  name_en: string;
  name_ar: string | null;
  address_en: string | null;
  address_ar: string | null;
  city: "abu_dhabi" | "dubai";
  neighborhood: string | null;
  cuisine_tags: string[];
  price_tier: 1 | 2 | 3 | 4 | null;
  phone: string | null;
  hours: Record<string, { open: string; close: string }> | null;
  status: string;
  quality_score: number;
  review_count: number;
  avg_rating: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  body: string | null;
  rating: number | null;
  status: string;
  visit_date: string | null;
  created_at: string;
  updated_at: string;
  user: User | null;
}

export interface Photo {
  id: string;
  place_id: string;
  user_id: string;
  review_id: string | null;
  cdn_url: string;
  caption: string | null;
  status: string;
  created_at: string;
}

export interface StampDefinition {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  icon_url: string | null;
  category: string | null;
  tier: number;
  is_founding: boolean;
}

export interface UserStamp {
  id: string;
  stamp_id: string;
  unlocked_at: string;
  stamp: StampDefinition | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PlaceSearchParams {
  q?: string;
  city?: "abu_dhabi" | "dubai";
  neighborhood?: string;
  cuisine?: string;
  price_tier?: number;
  lat?: number;
  lng?: number;
  radius_km?: number;
  page?: number;
  limit?: number;
}

export type City = "abu_dhabi" | "dubai";

// ---------------------------------------------------------------------------
// Discover
// ---------------------------------------------------------------------------

/**
 * A neighbourhood bucket groups the top places for a given neighbourhood.
 * The API returns these pre-sorted by quality_score descending.
 */
export interface NeighborhoodBucket {
  neighborhood: string;
  place_count: number;
  places: Place[];
}

/**
 * A curated collection is an editable, editor-maintained list of places
 * (e.g. "Best for breakfast", "Hidden gems", "New this week").
 * Collections are seeded in the DB and managed via the admin panel.
 */
export interface CuratedCollection {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  cover_url: string | null;
  places: Place[];
}
