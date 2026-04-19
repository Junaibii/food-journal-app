import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  getUserReviews,
  getUserStamps,
  followUser,
  unfollowUser,
  updateMe,
  type UserUpdatePayload,
} from "@/services/users";
import { getSaves } from "@/services/saves";
import { useAuthStore } from "@/stores/auth";
import type { UserProfile } from "@/types";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ["user", username],
    queryFn: () => getUserProfile(username),
    enabled: !!username,
    staleTime: 60_000,
  });
}

export function useUserReviews(username: string) {
  return useQuery({
    queryKey: ["user", username, "reviews"],
    queryFn: () => getUserReviews(username),
    enabled: !!username,
    staleTime: 60_000,
  });
}

export function useOwnSaves() {
  return useQuery({
    queryKey: ["saves"],
    queryFn: () => getSaves(1, 50),
    staleTime: 60_000,
  });
}

export function useUserStamps(username: string) {
  return useQuery({
    queryKey: ["user", username, "stamps"],
    queryFn: () => getUserStamps(username),
    enabled: !!username,
    staleTime: 120_000,
  });
}

// ---------------------------------------------------------------------------
// Follow / Unfollow — with optimistic updates
//
// Pattern:
//   onMutate  → cancel in-flight refetches, snapshot current data, apply the
//               optimistic change immediately so the UI responds without delay.
//   onError   → roll back to the snapshot if the request fails.
//   onSettled → always invalidate the cache so we re-sync with the server,
//               whether the mutation succeeded or failed.
// ---------------------------------------------------------------------------

type FollowContext = { previous: UserProfile | undefined };

export function useFollowMutation(username: string) {
  const qc = useQueryClient();
  const profileKey = ["user", username];

  const follow = useMutation<void, Error, void, FollowContext>({
    mutationFn: () => followUser(username),

    onMutate: async () => {
      // Prevent a concurrent refetch from overwriting our optimistic write.
      await qc.cancelQueries({ queryKey: profileKey });

      const previous = qc.getQueryData<UserProfile>(profileKey);

      qc.setQueryData<UserProfile>(profileKey, (old) =>
        old
          ? { ...old, is_following: true, follower_count: old.follower_count + 1 }
          : old,
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      // Roll back to the pre-mutation state.
      if (ctx?.previous !== undefined) {
        qc.setQueryData(profileKey, ctx.previous);
      }
    },

    onSettled: () => {
      // Re-sync with server regardless of success or failure.
      qc.invalidateQueries({ queryKey: profileKey });
    },
  });

  const unfollow = useMutation<void, Error, void, FollowContext>({
    mutationFn: () => unfollowUser(username),

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: profileKey });

      const previous = qc.getQueryData<UserProfile>(profileKey);

      qc.setQueryData<UserProfile>(profileKey, (old) =>
        old
          ? {
              ...old,
              is_following: false,
              follower_count: Math.max(0, old.follower_count - 1),
            }
          : old,
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(profileKey, ctx.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: profileKey });
    },
  });

  return { follow, unfollow };
}

// ---------------------------------------------------------------------------
// Update own profile
// ---------------------------------------------------------------------------

export function useUpdateProfile() {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (payload: UserUpdatePayload) => updateMe(payload),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      // Invalidate own profile cache (username may vary)
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
