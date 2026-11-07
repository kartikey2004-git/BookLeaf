import { describe, expect, it } from "vitest";
import { applyPriorityFloor } from "@repo/ai";

describe("ISBN AI priority floor", () => {
  it.each([
    ["ISBN_AND_METADATA", "LOW", "HIGH"],
    ["ISBN_AND_METADATA", "MEDIUM", "HIGH"],
    ["ISBN_AND_METADATA", "CRITICAL", "CRITICAL"],
    ["ROYALTY_AND_PAYMENTS", "LOW", "LOW"],
  ] as const)("maps %s %s to %s", (category, priority, expected) => {
    expect(applyPriorityFloor(category, priority)).toBe(expected);
  });
});
