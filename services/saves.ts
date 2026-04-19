import type { PaginatedResponse, Place } from "@/types";
import { apiClient } from "./api";

export interface SaveRecord {
  id: string;
  user_id: string;
  place_id: string;
  list_name: string;
  visited: boolean;
  visited_at: string | null;
  created_at: string;
  place: Place | null;
}

export async function savePlace(placeId: string, listName = "default"): Promise<SaveRecord> {
  const { data } = await apiClient.post<SaveRecord>("/saves", {
    place_id: placeId,
    list_name: listName,
  });
  return data;
}

export async function unsavePlace(saveId: string): Promise<void> {
  await apiClient.delete(`/saves/${saveId}`);
}

export async function getSaves(page = 1, limit = 20): Promise<PaginatedResponse<SaveRecord>> {
  const { data } = await apiClient.get<PaginatedResponse<SaveRecord>>("/saves", {
    params: { page, limit },
  });
  return data;
}
