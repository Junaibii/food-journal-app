/**
 * Tests for the 3-step presigned S3 upload flow:
 *   requestUploadUrl → uploadToS3 → confirmUpload
 *   and the orchestrating uploadPhoto helper.
 */
import {
  requestUploadUrl,
  uploadToS3,
  confirmUpload,
  uploadPhoto,
} from "@/services/photos";
import { apiClient } from "@/services/api";

// Mock axios client
jest.mock("@/services/api", () => ({
  apiClient: {
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock global fetch for S3 PUT
const mockFetch = jest.fn();
global.fetch = mockFetch;

const UPLOAD_URL = "https://bucket.s3.amazonaws.com/key?presigned=1";
const S3_KEY = "places/place-1/photo-abc.jpg";
const CDN_URL = "https://cdn.example.com/places/place-1/photo-abc.jpg";

const MOCK_UPLOAD_RESPONSE = {
  upload_url: UPLOAD_URL,
  s3_key: S3_KEY,
  expires_in: 900,
};

const MOCK_PHOTO = {
  id: "photo-1",
  place_id: "place-1",
  user_id: "user-1",
  review_id: "review-1",
  cdn_url: CDN_URL,
  caption: null,
  status: "active",
  created_at: "2025-01-01T00:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// requestUploadUrl
// ---------------------------------------------------------------------------

describe("requestUploadUrl", () => {
  it("posts to /photos/upload with correct payload", async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: MOCK_UPLOAD_RESPONSE });

    const result = await requestUploadUrl("place-1", "image/jpeg", "review-1");

    expect(apiClient.post).toHaveBeenCalledWith("/photos/upload", {
      place_id: "place-1",
      mime_type: "image/jpeg",
      review_id: "review-1",
    });
    expect(result.upload_url).toBe(UPLOAD_URL);
    expect(result.s3_key).toBe(S3_KEY);
  });

  it("passes null review_id when omitted", async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: MOCK_UPLOAD_RESPONSE });

    await requestUploadUrl("place-1", "image/png");

    expect(apiClient.post).toHaveBeenCalledWith("/photos/upload", {
      place_id: "place-1",
      mime_type: "image/png",
      review_id: null,
    });
  });

  it("throws on API error", async () => {
    (apiClient.post as jest.Mock).mockRejectedValue(new Error("Unauthorized"));

    await expect(requestUploadUrl("place-1", "image/jpeg")).rejects.toThrow("Unauthorized");
  });
});

// ---------------------------------------------------------------------------
// uploadToS3
// ---------------------------------------------------------------------------

describe("uploadToS3", () => {
  it("PUTs the blob to the presigned URL without auth headers", async () => {
    const fakeBlob = new Blob(["img-data"], { type: "image/jpeg" });
    // First fetch: get the file blob
    mockFetch
      .mockResolvedValueOnce({ blob: () => Promise.resolve(fakeBlob) })
      // Second fetch: PUT to S3
      .mockResolvedValueOnce({ ok: true, status: 200 });

    await uploadToS3(UPLOAD_URL, "file:///local/photo.jpg", "image/jpeg");

    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Second call must be PUT to S3 URL
    const [s3Url, s3Options] = mockFetch.mock.calls[1];
    expect(s3Url).toBe(UPLOAD_URL);
    expect(s3Options.method).toBe("PUT");
    expect(s3Options.headers["Content-Type"]).toBe("image/jpeg");
    // Must NOT send Authorization to S3
    expect(s3Options.headers?.Authorization).toBeUndefined();
  });

  it("throws when S3 returns a non-ok status", async () => {
    const fakeBlob = new Blob(["data"], { type: "image/jpeg" });
    mockFetch
      .mockResolvedValueOnce({ blob: () => Promise.resolve(fakeBlob) })
      .mockResolvedValueOnce({ ok: false, status: 403 });

    await expect(
      uploadToS3(UPLOAD_URL, "file:///local/photo.jpg", "image/jpeg"),
    ).rejects.toThrow("S3 upload failed: 403");
  });
});

// ---------------------------------------------------------------------------
// confirmUpload
// ---------------------------------------------------------------------------

describe("confirmUpload", () => {
  it("posts to /photos/confirm with correct payload", async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: MOCK_PHOTO });

    const result = await confirmUpload({
      s3_key: S3_KEY,
      place_id: "place-1",
      review_id: "review-1",
      caption: "Delicious!",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/photos/confirm", {
      s3_key: S3_KEY,
      place_id: "place-1",
      review_id: "review-1",
      caption: "Delicious!",
    });
    expect(result.cdn_url).toBe(CDN_URL);
  });
});

// ---------------------------------------------------------------------------
// uploadPhoto — full 3-step orchestration
// ---------------------------------------------------------------------------

describe("uploadPhoto", () => {
  it("executes all three steps in order and returns the Photo record", async () => {
    const fakeBlob = new Blob(["img"], { type: "image/jpeg" });
    mockFetch
      .mockResolvedValueOnce({ blob: () => Promise.resolve(fakeBlob) })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    (apiClient.post as jest.Mock)
      .mockResolvedValueOnce({ data: MOCK_UPLOAD_RESPONSE }) // requestUploadUrl
      .mockResolvedValueOnce({ data: MOCK_PHOTO });          // confirmUpload

    const result = await uploadPhoto(
      "file:///local/photo.jpg",
      "place-1",
      "image/jpeg",
      "review-1",
      "My caption",
    );

    // Step 1
    expect(apiClient.post).toHaveBeenNthCalledWith(1, "/photos/upload", expect.any(Object));
    // Step 2: S3 PUT (fetch call 2)
    expect(mockFetch.mock.calls[1][0]).toBe(UPLOAD_URL);
    // Step 3
    expect(apiClient.post).toHaveBeenNthCalledWith(2, "/photos/confirm", {
      s3_key: S3_KEY,
      place_id: "place-1",
      review_id: "review-1",
      caption: "My caption",
    });

    expect(result.id).toBe("photo-1");
    expect(result.cdn_url).toBe(CDN_URL);
  });

  it("aborts if the presigned URL request fails", async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error("Service unavailable"));

    await expect(
      uploadPhoto("file:///local/photo.jpg", "place-1", "image/jpeg"),
    ).rejects.toThrow("Service unavailable");

    // S3 PUT and confirm must NOT be called
    expect(mockFetch).not.toHaveBeenCalled();
    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });

  it("aborts confirm if S3 PUT fails", async () => {
    const fakeBlob = new Blob(["img"], { type: "image/jpeg" });
    mockFetch
      .mockResolvedValueOnce({ blob: () => Promise.resolve(fakeBlob) })
      .mockResolvedValueOnce({ ok: false, status: 500 });

    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: MOCK_UPLOAD_RESPONSE });

    await expect(
      uploadPhoto("file:///local/photo.jpg", "place-1", "image/jpeg"),
    ).rejects.toThrow("S3 upload failed: 500");

    // confirm should not be called
    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });
});
