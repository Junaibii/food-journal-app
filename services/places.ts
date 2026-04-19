import type { PaginatedResponse, Photo, Place, PlaceSearchParams, Review } from "@/types";
import { apiClient } from "./api";

export async function searchPlaces(params: PlaceSearchParams): Promise<PaginatedResponse<Place>> {
  const { data } = await apiClient.get<PaginatedResponse<Place>>("/places", { params });
  return data;
}

export async function getNearbyPlaces(
  lat: number,
  lng: number,
  radiusKm = 2,
  limit = 30,
): Promise<Place[]> {
  const { data } = await apiClient.get<Place[]>("/places/nearby", {
    params: { lat, lng, radius_km: radiusKm, limit },
  });
  return data;
}

export async function getPlace(id: string): Promise<Place> {
  const { data } = await apiClient.get<Place>(`/places/${id}`);
  return data;
}

export async function getPlaceReviews(
  id: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Review>> {
  const { data } = await apiClient.get<PaginatedResponse<Review>>(`/places/${id}/reviews`, {
    params: { page, limit },
  });
  return data;
}

export async function getPlacePhotos(id: string, limit = 30): Promise<Photo[]> {
  const { data } = await apiClient.get<Photo[]>(`/places/${id}/photos`, {
    params: { limit },
  });
  return data;
}
