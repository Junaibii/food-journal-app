import { useQuery } from "@tanstack/react-query";
import { getNeighborhoodBuckets, getCuratedCollections } from "@/services/discover";
import type { City } from "@/types";

// Cache keys are city-scoped so switching cities fetches fresh data.
const keys = {
  neighborhoods: (city?: City) =>
    city ? ["discover", "neighborhoods", city] : ["discover", "neighborhoods"],
  collections: (city?: City) =>
    city ? ["discover", "collections", city] : ["discover", "collections"],
};

export function useNeighborhoodBuckets(city?: City) {
  return useQuery({
    queryKey: keys.neighborhoods(city),
    queryFn: () => getNeighborhoodBuckets(city),
    staleTime: 5 * 60_000, // 5 min — curated content changes infrequently
  });
}

export function useCuratedCollections(city?: City) {
  return useQuery({
    queryKey: keys.collections(city),
    queryFn: () => getCuratedCollections(city),
    staleTime: 5 * 60_000,
  });
}
