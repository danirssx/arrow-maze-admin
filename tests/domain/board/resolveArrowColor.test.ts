import { describe, expect, it } from "vitest";
import { DEFAULT_ARROW_COLOR, resolveArrowColor } from "@/domain/board/resolveArrowColor";

describe("resolveArrowColor", () => {
  it.each([
    ["blue", "#4B6BFB"],
    ["green", "#3FD06A"],
    ["yellow", "#FFC83D"],
    ["pink", "#FF6FD8"],
    ["cyan", "#3FC8FF"],
    ["purple", "#A06BFF"],
    ["crimson", "#C23B57"],
    ["white", "#EEF1FF"],
    ["orange", "#FF9F1C"],
    ["teal", "#22C9B6"],
  ])("maps %s to the client palette hex %s", (name, hex) => {
    expect(resolveArrowColor(name)).toBe(hex);
  });

  it("falls back to the default slate for an unknown or empty colour", () => {
    expect(DEFAULT_ARROW_COLOR).toBe("#94A3B8");
    expect(resolveArrowColor("chartreuse")).toBe("#94A3B8");
    expect(resolveArrowColor("")).toBe("#94A3B8");
  });
});
