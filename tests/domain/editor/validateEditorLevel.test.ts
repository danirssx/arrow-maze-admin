import { describe, expect, it } from "vitest";
import type { EditorLevelModel } from "@/domain/editor/EditorLevelModel";
import { validateEditorLevel } from "@/domain/editor/validateEditorLevel";

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

  // --- CUSTOM board authoring (MAZ-222) ---

  function customModel(overrides: Partial<EditorLevelModel> = {}): EditorLevelModel {
    return validModel({
      mode: "CUSTOM",
      figureId: null,
      customCells: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
      arrows: [
        { id: "a", color: "cyan", direction: "RIGHT", path: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
      ],
      ...overrides,
    });
  }

  it("accepts a valid custom mask with arrows inside it", () => {
    expect(validateEditorLevel(customModel())).toEqual([]);
  });

  it("requires at least one custom board cell (@s1)", () => {
    expect(
      validateEditorLevel(customModel({ customCells: [], arrows: [] })),
    ).toContain("Select at least one board cell.");
  });

  it("rejects a custom cell outside the grid", () => {
    expect(
      validateEditorLevel(customModel({ customCells: [{ row: 0, col: 0 }, { row: 9, col: 9 }] })),
    ).toContain("Every board cell must be inside the grid.");
  });

  it("allows a disconnected custom mask with valid arrows (@s4)", () => {
    const model = customModel({
      customCells: [{ row: 0, col: 0 }, { row: 4, col: 4 }],
      arrows: [{ id: "a", color: "cyan", direction: "UP", path: [{ row: 0, col: 0 }] }],
    });
    expect(validateEditorLevel(model)).toEqual([]);
  });

  it("reports an arrow that leaves the custom mask (@s3)", () => {
    const model = customModel({
      customCells: [{ row: 0, col: 0 }],
      arrows: [{ id: "a", color: "cyan", direction: "UP", path: [{ row: 3, col: 3 }] }],
    });
    expect(validateEditorLevel(model)).toContain(
      "arrow #1: every cell must be inside the board figure.",
    );
  });

  it("does not flag arrow containment while the custom mask is still empty", () => {
    const model = customModel({
      customCells: [],
      arrows: [{ id: "a", color: "cyan", direction: "UP", path: [{ row: 0, col: 0 }] }],
    });
    const errors = validateEditorLevel(model);
    expect(errors).toContain("Select at least one board cell.");
    expect(errors).not.toContain("arrow #1: every cell must be inside the board figure.");
  });
});
