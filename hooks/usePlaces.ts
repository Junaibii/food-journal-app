import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getPlace, getPlacePhotos, getPlaceReviews, getNearbyPlaces, searchPlaces } from "@/services/places";
import type { PlaceSearchParams } from "@/types";

export function usePlaceSearch(params: PlaceSearchParams) {
  return useInfiniteQuery({
    queryKey: ["places", "search", params],
    queryFn: ({ pageParam = 1 }) => searchPlaces({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.pages ? lastPage.meta.page + 1 : undefined,
    staleTime: 60_000,
  });
}

export function useNearbyPlaces(lat: number | null, lng: number | null, radiusKm = 2) {
  return useQuery({
    queryKey: ["places", "nearby", lat, lng, radiusKm],
    queryFn: () => getNearbyPlaces(lat!, lng!, radiusKm),
    enabled: lat !== null && lng !== null,
    staleTime: 30_000,
  });
}

export function usePlace(id: string | null) {
  return useQuery({
    queryKey: ["place", id],
    queryFn: () => getPlace(id!),
    enabled: id !== null,
    staleTime: 60_000,
  });
}

export function usePlaceReviews(placeId: string) {
  return useInfiniteQuery({
    queryKey: ["place", placeId, "reviews"],
    queryFn: ({ pageParam = 1 }) => getPlaceReviews(placeId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.pages ? lastPage.meta.page + 1 : undefined,
  });
}

export function usePlacePhotos(placeId: string) {
  return useQuery({
    queryKey: ["place", placeId, "photos"],
    queryFn: () => getPlacePhotos(placeId),
    staleTime: 120_000,
  });
}
