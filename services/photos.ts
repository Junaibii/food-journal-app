/**
 * Photo upload flow:
 *
 *  1. Call requestUploadUrl()  → { upload_url, s3_key, expires_in }
 *  2. PUT binary image directly to upload_url (no auth header)
 *  3. Call confirmUpload()     → Photo record
 */
import type { Photo } from "@/types";
import { apiClient } from "./api";

export interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
  expires_in: number;
}

export interface ConfirmPayload {
  s3_key: string;
  place_id: string;
  review_id?: string;
  caption?: string;
}

export async function requestUploadUrl(
  placeId: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/heic",
  reviewId?: string,
): Promise<UploadUrlResponse> {
  const { data } = await apiClient.post<UploadUrlResponse>("/photos/upload", {
    place_id: placeId,
    mime_type: mimeType,
    review_id: reviewId ?? null,
  });
  return data;
}

export async function uploadToS3(
  uploadUrl: string,
  uri: string,
  mimeType: string,
): Promise<void> {
  // Fetch the local file as a blob and PUT directly to S3
  const resp = await fetch(uri);
  const blob = await resp.blob();

  const putResp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: blob,
  });

  if (!putResp.ok) {
    throw new Error(`S3 upload failed: ${putResp.status}`);
  }
}

export async function confirmUpload(payload: ConfirmPayload): Promise<Photo> {
  const { data } = await apiClient.post<Photo>("/photos/confirm", payload);
  return data;
}

/** Full three-step upload sequence. Returns the created Photo record. */
export async function uploadPhoto(
  localUri: string,
  placeId: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/heic",
  reviewId?: string,
  caption?: string,
): Promise<Photo> {
  const { upload_url, s3_key } = await requestUploadUrl(placeId, mimeType, reviewId);
  await uploadToS3(upload_url, localUri, mimeType);
  return confirmUpload({ s3_key, place_id: placeId, review_id: reviewId, caption });
}

export async function deletePhoto(id: string): Promise<void> {
  await apiClient.delete(`/photos/${id}`);
}

export async function reportPhoto(
  id: string,
  reason: string,
  notes?: string,
): Promise<void> {
  await apiClient.post(`/photos/${id}/report`, { reason, notes });
}
