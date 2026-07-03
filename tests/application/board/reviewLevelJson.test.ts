import { describe, expect, it } from "vitest";
import { reviewLevelJson } from "@/application/board/reviewLevelJson";

const validJson = JSON.stringify({
  name: "My Level",
  description: "desc",
  difficulty: "EASY",
  arrows: [{ id: "a", color: "cyan", direction: "UP", path: [{ row: 0, col: 0 }] }],
});

describe("reviewLevelJson", () => {
  it("treats empty or whitespace text as empty", () => {
    expect(reviewLevelJson("")).toEqual({ status: "empty", errors: [], value: null });
    expect(reviewLevelJson("   ")).toEqual({ status: "empty", errors: [], value: null });
  });

  it("reports a syntax error for unparseable text", () => {
    const review = reviewLevelJson("{ not json");
    expect(review.status).toBe("syntax-error");
    expect(review.errors[0]).toContain("Invalid JSON");
    expect(review.value).toBeNull();
  });

  it("reports invalid shape with the parsed value retained", () => {
    const review = reviewLevelJson(JSON.stringify({ arrows: [] }));
    expect(review.status).toBe("invalid");
    expect(review.errors.length).toBeGreaterThan(0);
    expect(review.value).toEqual({ arrows: [] });
  });

  it("returns valid with the parsed value for well-formed JSON", () => {
    const review = reviewLevelJson(validJson);
    expect(review.status).toBe("valid");
    expect(review.errors).toEqual([]);
    expect(review.value).toEqual(JSON.parse(validJson));
  });
});
