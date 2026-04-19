/**
 * useDiscover — tests for useNeighborhoodBuckets and useCuratedCollections.
 *
 * Verifies:
 *   1. Correct service functions are called with the right city.
 *   2. Data is surfaced correctly from React Query.
 *   3. Queries are re-keyed when the city changes (different cache entries).
 */
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useNeighborhoodBuckets, useCuratedCollections } from "@/hooks/useDiscover";
import * as discoverService from "@/services/discover";
import { createWrapper } from "../testUtils";

jest.mock("@/services/discover");

const MOCK_BUCKET = {
  neighborhood: "Downtown Dubai",
  place_count: 5,
  places: [
    {
      id: "place-1",
      name_en: "Cafe Arabica",
      name_ar: "كافيه عربيكا",
      address_en: "Downtown Dubai",
      address_ar: null,
      city: "dubai" as const,
      neighborhood: "Downtown Dubai",
      cuisine_tags: ["arabic"],
      price_tier: 2 as const,
      phone: null,
      hours: null,
      status: "active",
      quality_score: 88,
      review_count: 12,
      avg_rating: 4.2,
      latitude: 25.2,
      longitude: 55.27,
      created_at: "2025-01-01T00:00:00Z",
    },
  ],
};

const MOCK_COLLECTION = {
  id: "col-1",
  slug: "best-for-breakfast",
  title_en: "Best for Breakfast",
  title_ar: "الأفضل للإفطار",
  description_en: "Start your morning right.",
  description_ar: "ابدأ صباحك بشكل صحيح.",
  cover_url: null,
  places: [MOCK_BUCKET.places[0]],
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// useNeighborhoodBuckets
// ---------------------------------------------------------------------------
describe("useNeighborhoodBuckets", () => {
  it("fetches buckets and returns data", async () => {
    (discoverService.getNeighborhoodBuckets as jest.Mock).mockResolvedValue([
      MOCK_BUCKET,
    ]);

    const { result } = renderHook(() => useNeighborhoodBuckets("dubai"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(discoverService.getNeighborhoodBuckets).toHaveBeenCalledWith("dubai");
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].neighborhood).toBe("Downtown Dubai");
  });

  it("fetches without a city when city is undefined", async () => {
    (discoverService.getNeighborhoodBuckets as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useNeighborhoodBuckets(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(discoverService.getNeighborhoodBuckets).toHaveBeenCalledWith(undefined);
  });

  it("sets isError when the request fails", async () => {
    (discoverService.getNeighborhoodBuckets as jest.Mock).mockRejectedValue(
      new Error("Server error"),
    );

    const { result } = renderHook(() => useNeighborhoodBuckets("abu_dhabi"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("re-fetches when the city changes (independent cache keys)", async () => {
    (discoverService.getNeighborhoodBuckets as jest.Mock).mockResolvedValue([]);

    let currentCity: "dubai" | "abu_dhabi" = "dubai";

    const { result, rerender } = renderHook(
      () => useNeighborhoodBuckets(currentCity),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(discoverService.getNeighborhoodBuckets).toHaveBeenCalledWith("dubai");

    await act(async () => {
      currentCity = "abu_dhabi";
      rerender({});
    });

    await waitFor(() =>
      expect(discoverService.getNeighborhoodBuckets).toHaveBeenCalledWith(
        "abu_dhabi",
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// useCuratedCollections
// ---------------------------------------------------------------------------
describe("useCuratedCollections", () => {
  it("fetches collections and returns data", async () => {
    (discoverService.getCuratedCollections as jest.Mock).mockResolvedValue([
      MOCK_COLLECTION,
    ]);

    const { result } = renderHook(() => useCuratedCollections("dubai"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(discoverService.getCuratedCollections).toHaveBeenCalledWith("dubai");
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].slug).toBe("best-for-breakfast");
  });

  it("fetches without a city when city is undefined", async () => {
    (discoverService.getCuratedCollections as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useCuratedCollections(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(discoverService.getCuratedCollections).toHaveBeenCalledWith(undefined);
  });

  it("sets isError when the request fails", async () => {
    (discoverService.getCuratedCollections as jest.Mock).mockRejectedValue(
      new Error("Not found"),
    );

    const { result } = renderHook(() => useCuratedCollections("dubai"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("re-fetches when the city changes", async () => {
    (discoverService.getCuratedCollections as jest.Mock).mockResolvedValue([]);

    let currentCity: "dubai" | "abu_dhabi" = "dubai";

    const { result, rerender } = renderHook(
      () => useCuratedCollections(currentCity),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      currentCity = "abu_dhabi";
      rerender({});
    });

    await waitFor(() =>
      expect(discoverService.getCuratedCollections).toHaveBeenCalledWith(
        "abu_dhabi",
      ),
    );
  });
});
