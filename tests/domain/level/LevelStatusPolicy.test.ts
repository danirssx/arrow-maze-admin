import { describe, expect, it } from "vitest";
import { canArchive, canPublish } from "@/domain/level/LevelStatusPolicy";

describe("LevelStatusPolicy", () => {
  it("allows publishing only a DRAFT level", () => {
    expect(canPublish("DRAFT")).toBe(true);
    expect(canPublish("PUBLISHED")).toBe(false);
    expect(canPublish("ARCHIVED")).toBe(false);
  });

  it("allows archiving only a PUBLISHED level", () => {
    expect(canArchive("PUBLISHED")).toBe(true);
    expect(canArchive("DRAFT")).toBe(false);
    expect(canArchive("ARCHIVED")).toBe(false);
  });
});
