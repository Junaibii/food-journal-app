import { renderHook, waitFor } from "@testing-library/react-native";
import { useAllStamps, useMyStamps } from "@/hooks/usePassport";
import * as passportService from "@/services/passport";
import { createWrapper } from "../testUtils";

jest.mock("@/services/passport");

const mockStamps = [
  {
    id: "stamp-1",
    slug: "first_review",
    name_en: "First Review",
    name_ar: "أول تقييم",
    description_en: "Write your first review",
    description_ar: null,
    icon_url: null,
    category: "milestone",
    tier: 1,
    is_founding: false,
  },
  {
    id: "stamp-2",
    slug: "founding",
    name_en: "Founding Contributor",
    name_ar: "المساهم المؤسس",
    description_en: "Early community member",
    description_ar: null,
    icon_url: null,
    category: null,
    tier: 3,
    is_founding: true,
  },
];

const mockMyStamps = [
  {
    id: "user-stamp-1",
    stamp_id: "stamp-1",
    unlocked_at: "2025-03-01T10:00:00Z",
    stamp: mockStamps[0],
  },
];

describe("useAllStamps", () => {
  it("returns all stamp definitions", async () => {
    (passportService.getAllStamps as jest.Mock).mockResolvedValue(mockStamps);

    const { result } = renderHook(() => useAllStamps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].slug).toBe("first_review");
  });

  it("handles fetch error gracefully", async () => {
    (passportService.getAllStamps as jest.Mock).mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useAllStamps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useMyStamps", () => {
  it("returns user unlocked stamps", async () => {
    (passportService.getMyStamps as jest.Mock).mockResolvedValue(mockMyStamps);

    const { result } = renderHook(() => useMyStamps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].stamp_id).toBe("stamp-1");
  });

  it("returns empty array when no stamps unlocked", async () => {
    (passportService.getMyStamps as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useMyStamps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });
});
