import { describe, expect, it } from "vitest";
import { formatCreatedAt } from "@/presentation/level/formatCreatedAt";

describe("formatCreatedAt", () => {
  it("keeps only the date part of an ISO timestamp", () => {
    expect(formatCreatedAt("2026-07-02T10:00:00.000Z")).toBe("2026-07-02");
  });

  it("returns the raw value when there is no time separator", () => {
    expect(formatCreatedAt("2026-07-02")).toBe("2026-07-02");
  });
});
