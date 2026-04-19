import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview, deleteReview, type ReviewCreatePayload } from "@/services/reviews";
import { uploadPhoto } from "@/services/photos";
import { checkStamps } from "@/services/passport";
import type { LocalPhoto } from "@/stores/compose";

export function useCreateReview() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      review,
      photos,
    }: {
      review: ReviewCreatePayload;
      photos: LocalPhoto[];
    }) => {
      // 1. Create the review first
      const created = await createReview(review);

      // 2. Upload any attached photos in parallel
      if (photos.length > 0) {
        await Promise.all(
          photos.map((p) =>
            uploadPhoto(
              p.uri,
              review.place_id,
              p.mimeType,
              created.id,
              p.caption,
            ),
          ),
        );
      }

      return created;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["place", variables.review.place_id] });
      qc.invalidateQueries({ queryKey: ["places"] });
      // Fire-and-forget: check for newly earned stamps
      checkStamps().catch(() => {});
      qc.invalidateQueries({ queryKey: ["passport", "my-stamps"] });
    },
  });
}

export function useDeleteReview(placeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["place", placeId] });
    },
  });
}
