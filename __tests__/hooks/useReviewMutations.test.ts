import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useCreateReview, useDeleteReview } from "@/hooks/useReviewMutations";
import * as reviewsService from "@/services/reviews";
import * as photosService from "@/services/photos";
import * as passportService from "@/services/passport";
import { createWrapper } from "../testUtils";

jest.mock("@/services/reviews");
jest.mock("@/services/photos");
jest.mock("@/services/passport");

const MOCK_REVIEW = {
  id: "rev-1",
  place_id: "place-1",
  user_id: "user-1",
  body: "Great food!",
  rating: 4,
  status: "approved",
  visit_date: "2025-03-01",
  created_at: "2025-03-01T12:00:00Z",
  updated_at: "2025-03-01T12:00:00Z",
  user: null,
};

const MOCK_PHOTO = {
  id: "photo-1",
  place_id: "place-1",
  user_id: "user-1",
  review_id: "rev-1",
  cdn_url: "https://cdn.example.com/photo.jpg",
  caption: null,
  status: "active",
  created_at: "2025-03-01T12:00:00Z",
};

const LOCAL_PHOTO = {
  uri: "file:///local/photo.jpg",
  mimeType: "image/jpeg" as const,
  width: 800,
  height: 600,
};

beforeEach(() => {
  jest.clearAllMocks();
  (passportService.checkStamps as jest.Mock).mockResolvedValue(undefined);
});

describe("useCreateReview", () => {
  it("creates a review without photos", async () => {
    (reviewsService.createReview as jest.Mock).mockResolvedValue(MOCK_REVIEW);

    const { result } = renderHook(() => useCreateReview(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        review: { place_id: "place-1", rating: 4, body: "Great food!" },
        photos: [],
      });
    });

    expect(reviewsService.createReview).toHaveBeenCalledWith({
      place_id: "place-1",
      rating: 4,
      body: "Great food!",
    });
    expect(photosService.uploadPhoto).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("uploads photos in parallel after creating the review", async () => {
    (reviewsService.createReview as jest.Mock).mockResolvedValue(MOCK_REVIEW);
    (photosService.uploadPhoto as jest.Mock).mockResolvedValue(MOCK_PHOTO);

    const { result } = renderHook(() => useCreateReview(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        review: { place_id: "place-1", rating: 5 },
        photos: [LOCAL_PHOTO, { ...LOCAL_PHOTO, uri: "file:///local/photo2.jpg" }],
      });
    });

    // Review created first
    expect(reviewsService.createReview).toHaveBeenCalledTimes(1);
    // Both photos uploaded with review id attached
    expect(photosService.uploadPhoto).toHaveBeenCalledTimes(2);
    expect(photosService.uploadPhoto).toHaveBeenCalledWith(
      LOCAL_PHOTO.uri,
      "place-1",
      "image/jpeg",
      "rev-1",
      undefined,
    );
  });

  it("triggers passport stamp check after successful submission", async () => {
    (reviewsService.createReview as jest.Mock).mockResolvedValue(MOCK_REVIEW);

    const { result } = renderHook(() => useCreateReview(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        review: { place_id: "place-1", rating: 3 },
        photos: [],
      });
    });

    await waitFor(() => {
      expect(passportService.checkStamps).toHaveBeenCalledTimes(1);
    });
  });

  it("rejects when the review API call fails", async () => {
    (reviewsService.createReview as jest.Mock).mockRejectedValue(
      new Error("Place not found"),
    );

    const { result } = renderHook(() => useCreateReview(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          review: { place_id: "place-1", rating: 4 },
          photos: [],
        }),
      ).rejects.toThrow("Place not found");
    });

    expect(photosService.uploadPhoto).not.toHaveBeenCalled();
    expect(passportService.checkStamps).not.toHaveBeenCalled();
  });

  it("rejects when a photo upload fails after review is created", async () => {
    (reviewsService.createReview as jest.Mock).mockResolvedValue(MOCK_REVIEW);
    (photosService.uploadPhoto as jest.Mock).mockRejectedValue(
      new Error("S3 upload failed: 500"),
    );

    const { result } = renderHook(() => useCreateReview(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          review: { place_id: "place-1", rating: 4 },
          photos: [LOCAL_PHOTO],
        }),
      ).rejects.toThrow("S3 upload failed: 500");
    });
  });
});

describe("useDeleteReview", () => {
  it("calls deleteReview with the correct id", async () => {
    (reviewsService.deleteReview as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteReview("place-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync("rev-1");
    });

    expect(reviewsService.deleteReview).toHaveBeenCalledWith("rev-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
