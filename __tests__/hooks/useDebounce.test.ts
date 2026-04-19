import { act, renderHook } from "@testing-library/react-native";
import { useDebounce } from "@/hooks/useDebounce";

jest.useFakeTimers();

describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update before delay", () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: "hello" } },
    );
    rerender({ v: "world" });
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe("hello");
  });

  it("updates after delay", () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: "hello" } },
    );
    rerender({ v: "world" });
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe("world");
  });
});
