import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";

describe("useAsyncOperation", () => {
  it("starts with idle state", () => {
    const { result } = renderHook(() => useAsyncOperation());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it("handles successful operation", async () => {
    const { result } = renderHook(() => useAsyncOperation<string>());
    
    await act(async () => {
      await result.current.execute(async () => "success");
    });

    expect(result.current.data).toBe("success");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("handles failed operation", async () => {
    const { result } = renderHook(() =>
      useAsyncOperation({ errorMessage: "Custom error" })
    );

    await act(async () => {
      await result.current.execute(async () => {
        throw new Error("fail");
      });
    });

    expect(result.current.error?.message).toBe("fail");
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it("resets state", async () => {
    const { result } = renderHook(() => useAsyncOperation<string>());

    await act(async () => {
      await result.current.execute(async () => "data");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
