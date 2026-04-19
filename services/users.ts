import type { User, UserProfile, Review, UserStamp, PaginatedResponse } from "@/types";
import type { SaveRecord } from "./saves";
import { apiClient } from "./api";

export interface UserUpdatePayload {
  display_name?: string | null;
  bio?: string | null;
  locale?: "en" | "ar";
  avatar_url?: string | null;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/users/me");
  return data;
}

export async function updateMe(payload: UserUpdatePayload): Promise<User> {
  const { data } = await apiClient.patch<User>("/users/me", payload);
  return data;
}

export async function getUserProfile(username: string): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>(`/users/${username}`);
  return data;
}

export async function getUserReviews(
  username: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Review>> {
  const { data } = await apiClient.get<PaginatedResponse<Review>>(
    `/users/${username}/reviews`,
    { params: { page, limit } },
  );
  return data;
}

export async function getUserStamps(username: string): Promise<UserStamp[]> {
  const { data } = await apiClient.get<UserStamp[]>(`/users/${username}/stamps`);
  return data;
}

export async function followUser(username: string): Promise<void> {
  await apiClient.post(`/users/${username}/follow`);
}

export async function unfollowUser(username: string): Promise<void> {
  await apiClient.delete(`/users/${username}/follow`);
}
