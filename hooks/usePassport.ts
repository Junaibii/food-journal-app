import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllStamps, getMyStamps, checkStamps } from "@/services/passport";

export function useAllStamps() {
  return useQuery({
    queryKey: ["passport", "stamps"],
    queryFn: getAllStamps,
    staleTime: 5 * 60_000,
  });
}

export function useMyStamps() {
  return useQuery({
    queryKey: ["passport", "my-stamps"],
    queryFn: getMyStamps,
    staleTime: 60_000,
  });
}

export function useCheckStamps() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkStamps,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["passport", "my-stamps"] }),
  });
}
