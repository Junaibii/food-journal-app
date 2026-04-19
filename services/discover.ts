import type { City, CuratedCollection, NeighborhoodBucket } from "@/types";
import { apiClient } from "./api";

type DiscoverCity = Extract<City, "abu_dhabi" | "dubai">;

/**
 * Returns neighbourhood buckets for the given city, each containing the
 * top places for that neighbourhood (sorted by quality_score).
 */
export async function getNeighborhoodBuckets(
  city?: DiscoverCity,
): Promise<NeighborhoodBucket[]> {
  const params: { city?: DiscoverCity } = city ? { city } : {};
  const { data } = await apiClient.get<NeighborhoodBucket[]>(
    "/discover/neighborhoods",
    { params },
  );
  return data;
}

/**
 * Returns curated collections for the given city.
 */
export async function getCuratedCollections(
  city?: DiscoverCity,
): Promise<CuratedCollection[]> {
  const params: { city?: DiscoverCity } = city ? { city } : {};
  const { data } = await apiClient.get<CuratedCollection[]>(
    "/discover/collections",
    { params },
  );
  return data;
}
