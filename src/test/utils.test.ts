import { describe, it, expect } from "vitest";
import { cn, formatINR, applyDiscount } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });
});

describe("formatINR", () => {
  it("formats number as INR currency", () => {
    const result = formatINR(1500);
    expect(result).toContain("1,500");
  });

  it("handles zero", () => {
    const result = formatINR(0);
    expect(result).toContain("0");
  });
});

describe("applyDiscount", () => {
  it("applies percentage discount", () => {
    expect(applyDiscount(1000, 10)).toBe(900);
  });

  it("handles 0% discount", () => {
    expect(applyDiscount(500, 0)).toBe(500);
  });

  it("handles 100% discount", () => {
    expect(applyDiscount(500, 100)).toBe(0);
  });
});
