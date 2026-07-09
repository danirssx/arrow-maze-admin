import { describe, expect, it } from "vitest";
import {
  LEVEL_STATUS_FILTER_OPTIONS,
  toStatusQuery,
} from "@/application/level/LevelStatusFilter";

describe("LevelStatusFilter", () => {
  it("maps ALL to no status query", () => {
    expect(toStatusQuery("ALL")).toBeUndefined();
  });

  it("passes a concrete status through unchanged", () => {
    expect(toStatusQuery("DRAFT")).toBe("DRAFT");
    expect(toStatusQuery("PUBLISHED")).toBe("PUBLISHED");
    expect(toStatusQuery("ARCHIVED")).toBe("ARCHIVED");
  });

  it("offers ALL plus every status as filter options", () => {
    expect(LEVEL_STATUS_FILTER_OPTIONS).toEqual(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"]);
  });
});
