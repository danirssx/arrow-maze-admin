import { describe, expect, it } from "vitest";
import { ADMIN_SECTIONS } from "@/presentation/navigation/adminSections";
import { resolveActiveSection } from "@/presentation/navigation/resolveActiveSection";

describe("resolveActiveSection", () => {
  it("matches the exact section path", () => {
    expect(resolveActiveSection("/leaderboard", ADMIN_SECTIONS)).toBe("leaderboard");
  });

  it("matches a nested route to its owning section", () => {
    expect(resolveActiveSection("/levels/123", ADMIN_SECTIONS)).toBe("levels");
  });

  it("returns null when no section owns the path", () => {
    expect(resolveActiveSection("/", ADMIN_SECTIONS)).toBeNull();
    expect(resolveActiveSection("/unknown", ADMIN_SECTIONS)).toBeNull();
  });

  it("does not match a section whose path is only a string prefix, not a route segment", () => {
    const sections = [
      { id: "levels", path: "/levels", label: "Levels" },
      { id: "levelsx", path: "/levelsx", label: "LevelsX" },
    ];
    expect(resolveActiveSection("/levelsx", sections)).toBe("levelsx");
  });

  it("prefers the longest matching section path", () => {
    const sections = [
      { id: "a", path: "/a", label: "A" },
      { id: "ab", path: "/a/b", label: "AB" },
    ];
    expect(resolveActiveSection("/a/b/c", sections)).toBe("ab");
  });
});
