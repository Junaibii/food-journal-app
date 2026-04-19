import { renderHook, waitFor } from "@testing-library/react-native";
import {
  useUserProfile,
  useUserReviews,
  useUserStamps,
  useOwnSaves,
} from "@/hooks/useProfile";
import * as usersService from "@/services/users";
import * as savesService from "@/services/saves";
import { createWrapper } from "../testUtils";

jest.mock("@/services/users");
jest.mock("@/services/saves");

const MOCK_PROFILE = {
  id: "user-1",
  username: "testuser",
  display_name: "Test User",
  bio: "Hello",
  avatar_url: null,
  locale: "en",
  is_founding_member: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  review_count: 5,
  stamp_count: 2,
  save_count: 3,
  follower_count: 10,
  following_count: 4,
  is_following: false,
};

const MOCK_REVIEW = {
  id: "rev-1",
  place_id: "place-1",
  user_id: "user-1",
  body: "Great!",
  rating: 4,
  status: "approved",
  visit_date: "2025-03-01",
  created_at: "2025-03-01T12:00:00Z",
  updated_at: "2025-03-01T12:00:00Z",
  user: null,
};

const MOCK_STAMP = {
  id: "us-1",
  user_id: "user-1",
  stamp_id: "stamp-1",
  unlocked_at: "2025-03-01T12:00:00Z",
  stamp: { id: "stamp-1", slug: "first-review", name_en: "First Review", name_ar: "أول تقييم", description_en: "", description_ar: "", icon_url: "", tier: "bronze", sort_order: 1 },
};

const MOCK_SAVE = {
  id: "save-1",
  user_id: "user-1",
  place_id: "place-1",
  visited: false,
  created_at: "2025-03-01T12:00:00Z",
  place: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useUserProfile", () => {
  it("fetches and returns the user profile", async () => {
    (usersService.getUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE);

    const { result } = renderHook(() => useUserProfile("testuser"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(usersService.getUserProfile).toHaveBeenCalledWith("testuser");
    expect(result.current.data).toEqual(MOCK_PROFILE);
  });

  it("does not fetch when username is empty", async () => {
    const { result } = renderHook(() => useUserProfile(""), {
      wrapper: createWrapper(),
    });

    // Query is disabled — should stay in loading/idle state
    expect(result.current.isFetching).toBe(false);
    expect(usersService.getUserProfile).not.toHaveBeenCalled();
  });

  it("sets isError when the request fails", async () => {
    (usersService.getUserProfile as jest.Mock).mockRejectedValue(
      new Error("Not found"),
    );

    const { result } = renderHook(() => useUserProfile("ghost"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useUserReviews", () => {
  it("fetches reviews for a given username", async () => {
    (usersService.getUserReviews as jest.Mock).mockResolvedValue({
      data: [MOCK_REVIEW],
      meta: { total: 1, page: 1, limit: 20, pages: 1 },
    });

    const { result } = renderHook(() => useUserReviews("testuser"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(usersService.getUserReviews).toHaveBeenCalledWith("testuser");
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].id).toBe("rev-1");
  });

  it("does not fetch when username is empty", () => {
    renderHook(() => useUserReviews(""), { wrapper: createWrapper() });
    expect(usersService.getUserReviews).not.toHaveBeenCalled();
  });
});

describe("useUserStamps", () => {
  it("fetches stamps for a given username", async () => {
    (usersService.getUserStamps as jest.Mock).mockResolvedValue([MOCK_STAMP]);

    const { result } = renderHook(() => useUserStamps("testuser"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(usersService.getUserStamps).toHaveBeenCalledWith("testuser");
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].stamp_id).toBe("stamp-1");
  });
});

describe("useOwnSaves", () => {
  it("fetches saves for the authenticated user", async () => {
    (savesService.getSaves as jest.Mock).mockResolvedValue({
      data: [MOCK_SAVE],
      meta: { total: 1, page: 1, limit: 50, pages: 1 },
    });

    const { result } = renderHook(() => useOwnSaves(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(savesService.getSaves).toHaveBeenCalledWith(1, 50);
    expect(result.current.data?.data).toHaveLength(1);
  });
});
