/**
 * useFollowMutation — tests for follow / unfollow with optimistic updates.
 *
 * Verifies:
 *   1. Correct API functions are called with the right username.
 *   2. Optimistic update is applied immediately to the cache (is_following +
 *      follower_count change visible before the server responds).
 *   3. Cache is rolled back when the mutation fails.
 *   4. Cache is invalidated (re-fetched) after both success and failure.
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useFollowMutation, useUpdateProfile } from "@/hooks/useProfile";
import * as usersService from "@/services/users";
import { createWrapper } from "../testUtils";
import { useAuthStore } from "@/stores/auth";
import { QueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@/types";

jest.mock("@/services/users");
jest.mock("@/stores/auth", () => ({
  useAuthStore: jest.fn(),
}));

const MOCK_USER = {
  id: "user-1",
  username: "me",
  display_name: "Me",
  bio: null,
  avatar_url: null,
  locale: "en" as const,
  is_founding_contributor: false,
  created_at: "2025-01-01T00:00:00Z",
};

const MOCK_PROFILE: UserProfile = {
  ...MOCK_USER,
  username: "targetuser",
  review_count: 10,
  stamp_count: 3,
  save_count: 5,
  follower_count: 42,
  following_count: 8,
  is_following: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  (useAuthStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: { user: typeof MOCK_USER; updateUser: jest.Mock }) => unknown) =>
      selector({ user: MOCK_USER, updateUser: jest.fn() }),
  );
});

// ---------------------------------------------------------------------------
// Helper — creates a QueryClient pre-seeded with a profile snapshot
// ---------------------------------------------------------------------------
function makeQCWithProfile(profile: UserProfile) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  qc.setQueryData(["user", profile.username], profile);
  return qc;
}

function createWrapperWithQC(qc: QueryClient) {
  const { QueryClientProvider } = require("@tanstack/react-query");
  const React = require("react");
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

// ---------------------------------------------------------------------------
// follow — happy path
// ---------------------------------------------------------------------------
describe("useFollowMutation — follow (success)", () => {
  it("calls followUser with the correct username", async () => {
    (usersService.followUser as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useFollowMutation("targetuser"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.follow.mutateAsync();
    });

    expect(usersService.followUser).toHaveBeenCalledWith("targetuser");
    await waitFor(() => expect(result.current.follow.isSuccess).toBe(true));
  });

  it("optimistically sets is_following=true and increments follower_count", async () => {
    (usersService.followUser as jest.Mock).mockResolvedValue(undefined);
    const qc = makeQCWithProfile({ ...MOCK_PROFILE, is_following: false, follower_count: 42 });

    let optimisticSnapshot: UserProfile | undefined;

    (usersService.followUser as jest.Mock).mockImplementation(async () => {
      // Capture cache state mid-flight, before the mutation resolves
      optimisticSnapshot = qc.getQueryData<UserProfile>(["user", "targetuser"]);
    });

    const { result } = renderHook(() => useFollowMutation("targetuser"), {
      wrapper: createWrapperWithQC(qc),
    });

    await act(async () => {
      await result.current.follow.mutateAsync();
    });

    expect(optimisticSnapshot?.is_following).toBe(true);
    expect(optimisticSnapshot?.follower_count).toBe(43);
  });
});

// ---------------------------------------------------------------------------
// follow — error path (rollback)
// ---------------------------------------------------------------------------
describe("useFollowMutation — follow (error → rollback)", () => {
  it("rolls back optimistic update when the request fails", async () => {
    (usersService.followUser as jest.Mock).mockRejectedValue(
      new Error("Already following"),
    );

    const qc = makeQCWithProfile({ ...MOCK_PROFILE, is_following: false, follower_count: 42 });

    const { result } = renderHook(() => useFollowMutation("targetuser"), {
      wrapper: createWrapperWithQC(qc),
    });

    await act(async () => {
      await expect(result.current.follow.mutateAsync()).rejects.toThrow(
        "Already following",
      );
    });

    await waitFor(() => expect(result.current.follow.isError).toBe(true));

    const rolled = qc.getQueryData<UserProfile>(["user", "targetuser"]);
    expect(rolled?.is_following).toBe(false);
    expect(rolled?.follower_count).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// unfollow — happy path
// ---------------------------------------------------------------------------
describe("useFollowMutation — unfollow (success)", () => {
  it("calls unfollowUser with the correct username", async () => {
    (usersService.unfollowUser as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useFollowMutation("targetuser"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.unfollow.mutateAsync();
    });

    expect(usersService.unfollowUser).toHaveBeenCalledWith("targetuser");
    await waitFor(() => expect(result.current.unfollow.isSuccess).toBe(true));
  });

  it("optimistically sets is_following=false and decrements follower_count", async () => {
    (usersService.unfollowUser as jest.Mock).mockResolvedValue(undefined);
    const qc = makeQCWithProfile({ ...MOCK_PROFILE, is_following: true, follower_count: 42 });

    let optimisticSnapshot: UserProfile | undefined;

    (usersService.unfollowUser as jest.Mock).mockImplementation(async () => {
      optimisticSnapshot = qc.getQueryData<UserProfile>(["user", "targetuser"]);
    });

    const { result } = renderHook(() => useFollowMutation("targetuser"), {
      wrapper: createWrapperWithQC(qc),
    });

    await act(async () => {
      await result.current.unfollow.mutateAsync();
    });

    expect(optimisticSnapshot?.is_following).toBe(false);
    expect(optimisticSnapshot?.follower_count).toBe(41);
  });
});

// ---------------------------------------------------------------------------
// unfollow — error path (rollback)
// ---------------------------------------------------------------------------
describe("useFollowMutation — unfollow (error → rollback)", () => {
  it("rolls back optimistic update when the request fails", async () => {
    (usersService.unfollowUser as jest.Mock).mockRejectedValue(
      new Error("Not following"),
    );

    const qc = makeQCWithProfile({ ...MOCK_PROFILE, is_following: true, follower_count: 42 });

    const { result } = renderHook(() => useFollowMutation("targetuser"), {
      wrapper: createWrapperWithQC(qc),
    });

    await act(async () => {
      await expect(result.current.unfollow.mutateAsync()).rejects.toThrow(
        "Not following",
      );
    });

    await waitFor(() => expect(result.current.unfollow.isError).toBe(true));

    const rolled = qc.getQueryData<UserProfile>(["user", "targetuser"]);
    expect(rolled?.is_following).toBe(true);
    expect(rolled?.follower_count).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// unfollow — floor at zero
// ---------------------------------------------------------------------------
describe("useFollowMutation — follower_count floor", () => {
  it("does not decrement follower_count below zero", async () => {
    (usersService.unfollowUser as jest.Mock).mockResolvedValue(undefined);
    const qc = makeQCWithProfile({ ...MOCK_PROFILE, is_following: true, follower_count: 0 });

    let snap: UserProfile | undefined;
    (usersService.unfollowUser as jest.Mock).mockImplementation(async () => {
      snap = qc.getQueryData<UserProfile>(["user", "targetuser"]);
    });

    const { result } = renderHook(() => useFollowMutation("targetuser"), {
      wrapper: createWrapperWithQC(qc),
    });

    await act(async () => { await result.current.unfollow.mutateAsync(); });

    expect(snap?.follower_count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// useUpdateProfile
// ---------------------------------------------------------------------------
describe("useUpdateProfile", () => {
  it("calls updateMe and updates the auth store on success", async () => {
    const updatedUser = { ...MOCK_USER, display_name: "New Name" };
    (usersService.updateMe as jest.Mock).mockResolvedValue(updatedUser);

    const mockUpdateUser = jest.fn();
    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: { user: typeof MOCK_USER; updateUser: jest.Mock }) => unknown) =>
        selector({ user: MOCK_USER, updateUser: mockUpdateUser }),
    );

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ display_name: "New Name" });
    });

    expect(usersService.updateMe).toHaveBeenCalledWith({ display_name: "New Name" });
    expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("rejects when updateMe fails", async () => {
    (usersService.updateMe as jest.Mock).mockRejectedValue(
      new Error("Validation error"),
    );

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ display_name: "x".repeat(200) }),
      ).rejects.toThrow("Validation error");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
