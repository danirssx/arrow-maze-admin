import { describe, expect, it } from "vitest";
import type { EditorLevelModel } from "@/domain/editor/EditorLevelModel";
import { validateEditorLevel } from "@/domain/editor/validateEditorLevel";

function validModel(overrides: Partial<EditorLevelModel> = {}): EditorLevelModel {
  return {
    name: "Level",
    description: "d",
    difficulty: "EASY",
    attempts: 5,
    figureId: "SQUARE",
    arrows: [
      { id: "a", color: "cyan", direction: "RIGHT", path: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
    ],
    ...overrides,
  };
}

describe("validateEditorLevel", () => {
  it("returns no errors for a valid model", () => {
    expect(validateEditorLevel(validModel())).toEqual([]);
  });

  it("requires a name", () => {
    expect(validateEditorLevel(validModel({ name: "  " }))).toContain("`name` is required.");
  });

  it("requires a valid difficulty", () => {
    expect(validateEditorLevel(validModel({ difficulty: "X" }))).toContain(
      "`difficulty` must be one of EASY, MEDIUM, HARD.",
    );
  });

  it("requires a selected figure", () => {
    expect(validateEditorLevel(validModel({ figureId: null }))).toContain(
      "A board figure must be selected.",
    );
  });

  it("requires at least one arrow", () => {
    expect(validateEditorLevel(validModel({ arrows: [] }))).toContain("Add at least one arrow.");
  });

  it("requires unique arrow ids", () => {
    const arrows = [
      { id: "a", color: "cyan", direction: "RIGHT" as const, path: [{ row: 0, col: 0 }] },
      { id: "a", color: "blue", direction: "RIGHT" as const, path: [{ row: 1, col: 0 }] },
    ];
    expect(validateEditorLevel(validModel({ arrows }))).toContain("Arrow ids must be unique.");
  });

  it("reports an arrow that leaves the figure mask", () => {
    // DIAMOND has no cell at (0,0)
    const model = validModel({
      figureId: "DIAMOND",
      arrows: [{ id: "a", color: "cyan", direction: "RIGHT", path: [{ row: 0, col: 0 }] }],
    });
    expect(validateEditorLevel(model)).toContain("arrow #1: every cell must be inside the board figure.");
  });

  it("reports a disconnected path", () => {
    const model = validModel({
      arrows: [{ id: "a", color: "cyan", direction: "RIGHT", path: [{ row: 0, col: 0 }, { row: 0, col: 2 }] }],
    });
    expect(validateEditorLevel(model)).toContain("arrow #1: path must be orthogonally connected.");
  });

  it("reports a self-crossing path", () => {
    const model = validModel({
      arrows: [
        {
          id: "a",
          color: "cyan",
          direction: "UP",
          path: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 0 }],
        },
      ],
    });
    expect(validateEditorLevel(model)).toContain("arrow #1: path must not cross itself.");
  });

  it("reports a head that points back into the body", () => {
    const model = validModel({
      arrows: [{ id: "a", color: "cyan", direction: "LEFT", path: [{ row: 0, col: 0 }, { row: 0, col: 1 }] }],
    });
    expect(validateEditorLevel(model)).toContain(
      "arrow #1: the arrow head must not point back into its body.",
    );
  });

  it("reports an empty arrow path", () => {
    const model = validModel({ arrows: [{ id: "a", color: "cyan", direction: "UP", path: [] }] });
    expect(validateEditorLevel(model)).toContain("arrow #1: path must have at least one cell.");
  });

  it("does not flag head-into-body for a single-cell arrow", () => {
    const model = validModel({
      arrows: [{ id: "a", color: "cyan", direction: "UP", path: [{ row: 0, col: 0 }] }],
    });
    expect(validateEditorLevel(model)).toEqual([]);
  });
});
