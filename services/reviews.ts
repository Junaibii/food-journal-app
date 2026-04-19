import type { PaginatedResponse, Review } from "@/types";
import { apiClient } from "./api";

export interface ReviewCreatePayload {
  place_id: string;
  body?: string;
  rating?: number;
  visit_date?: string; // ISO date string YYYY-MM-DD
}

export interface ReviewUpdatePayload {
  body?: string;
  rating?: number;
  visit_date?: string;
}

export async function createReview(payload: ReviewCreatePayload): Promise<Review> {
  const { data } = await apiClient.post<Review>("/reviews", payload);
  return data;
}

export async function updateReview(id: string, payload: ReviewUpdatePayload): Promise<Review> {
  const { data } = await apiClient.patch<Review>(`/reviews/${id}`, payload);
  return data;
}

export async function deleteReview(id: string): Promise<void> {
  await apiClient.delete(`/reviews/${id}`);
}

export async function reportReview(
  id: string,
  reason: string,
  notes?: string,
): Promise<void> {
  await apiClient.post(`/reviews/${id}/report`, { reason, notes });
}
