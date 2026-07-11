import { describe, expect, it } from "vitest";
import type { EditorLevelModel } from "@/domain/editor/EditorLevelModel";
import { reviewEditorLevel } from "@/application/editor/reviewEditorLevel";

function validModel(overrides: Partial<EditorLevelModel> = {}): EditorLevelModel {
  return {
    name: "Level",
    description: "d",
    difficulty: "EASY",
    attempts: 5,
    mode: "PRESET",
    figureId: "SQUARE",
    customCells: [],
    arrows: [
      { id: "a", color: "cyan", direction: "RIGHT", path: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
    ],
    ...overrides,
  };
}

describe("reviewEditorLevel", () => {
  it("reports errors and no value for an invalid model", () => {
    const review = reviewEditorLevel(validModel({ figureId: null, name: "" }));
    expect(review.valid).toBe(false);
    expect(review.errors.length).toBeGreaterThan(0);
    expect(review.value).toBeNull();
  });

  it("returns the exported value for a valid model", () => {
    const review = reviewEditorLevel(validModel());
    expect(review.valid).toBe(true);
    expect(review.errors).toEqual([]);
    expect(review.value).toMatchObject({
      name: "Level",
      difficulty: "EASY",
      boardShape: { type: "CELL_MASK" },
    });
  });
});
