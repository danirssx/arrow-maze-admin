import { describe, expect, it } from "vitest";
import { validateLevelDraft } from "@/domain/board/validateLevelDraft";

function validDraft(): Record<string, unknown> {
  return {
    name: "My Level",
    description: "desc",
    difficulty: "EASY",
    attempts: 5,
    arrows: [
      { id: "a", color: "cyan", direction: "UP", path: [{ row: 1, col: 0 }, { row: 0, col: 0 }] },
    ],
    boardShape: { type: "CELL_MASK", cells: [{ row: 0, col: 0 }] },
  };
}

describe("validateLevelDraft", () => {
  it("returns no errors for a well-formed level", () => {
    expect(validateLevelDraft(validDraft())).toEqual([]);
  });

  it("accepts a level without the optional boardShape / attempts / timeLimit", () => {
    const draft = validDraft();
    delete draft.boardShape;
    delete draft.attempts;
    expect(validateLevelDraft(draft)).toEqual([]);
  });

  it.each(["EASY", "MEDIUM", "HARD"])("accepts difficulty %s", (difficulty) => {
    expect(validateLevelDraft({ ...validDraft(), difficulty })).toEqual([]);
  });

  it.each(["UP", "DOWN", "LEFT", "RIGHT"])("accepts arrow direction %s", (direction) => {
    const draft = validDraft();
    draft.arrows = [{ id: "a", color: "cyan", direction, path: [{ row: 0, col: 0 }] }];
    expect(validateLevelDraft(draft)).toEqual([]);
  });

  it("rejects a non-object", () => {
    expect(validateLevelDraft(null)).toEqual(["Level JSON must be an object."]);
    expect(validateLevelDraft([])).toEqual(["Level JSON must be an object."]);
  });

  it("reports a missing or empty name", () => {
    expect(validateLevelDraft({ ...validDraft(), name: "" })).toContain(
      "`name` is required and must be a non-empty string.",
    );
    expect(validateLevelDraft({ ...validDraft(), name: "   " })).toContain(
      "`name` is required and must be a non-empty string.",
    );
  });

  it("reports an invalid difficulty", () => {
    expect(validateLevelDraft({ ...validDraft(), difficulty: "TRICKY" })).toContain(
      "`difficulty` must be one of EASY, MEDIUM, HARD.",
    );
  });

  it("reports a missing or empty arrows array", () => {
    expect(validateLevelDraft({ ...validDraft(), arrows: [] })).toContain(
      "`arrows` is required and must be a non-empty array.",
    );
    const noArrows = validDraft();
    delete noArrows.arrows;
    expect(validateLevelDraft(noArrows)).toContain(
      "`arrows` is required and must be a non-empty array.",
    );
  });

  it("reports per-arrow shape errors with a 1-based index", () => {
    const draft = validDraft();
    draft.arrows = [{ id: "", color: "cyan", direction: "SIDE", path: [] }];
    const errors = validateLevelDraft(draft);
    expect(errors).toContain("arrow #1: `id` must be a non-empty string.");
    expect(errors).toContain("arrow #1: `direction` must be one of UP, DOWN, LEFT, RIGHT.");
    expect(errors).toContain("arrow #1: `path` must be a non-empty array of {row, col} integers.");
  });

  it("reports a non-object arrow", () => {
    const draft = validDraft();
    draft.arrows = [5];
    expect(validateLevelDraft(draft)).toContain("arrow #1 must be an object.");
  });

  it("reports a non-integer path cell", () => {
    const draft = validDraft();
    draft.arrows = [{ id: "a", color: "cyan", direction: "UP", path: [{ row: 0.5, col: 0 }] }];
    expect(validateLevelDraft(draft)).toContain(
      "arrow #1: `path` must be a non-empty array of {row, col} integers.",
    );
  });

  it("rejects a path that mixes valid and invalid cells (every cell must be valid)", () => {
    const draft = validDraft();
    draft.arrows = [
      { id: "a", color: "cyan", direction: "UP", path: [{ row: 0, col: 0 }, { row: 0.5, col: 0 }] },
    ];
    expect(validateLevelDraft(draft)).toContain(
      "arrow #1: `path` must be a non-empty array of {row, col} integers.",
    );
  });

  it("reports an empty arrow colour independently of other fields", () => {
    const draft = validDraft();
    draft.arrows = [{ id: "a", color: "", direction: "UP", path: [{ row: 0, col: 0 }] }];
    expect(validateLevelDraft(draft)).toContain("arrow #1: `color` must be a non-empty string.");
  });

  it("reports a malformed boardShape", () => {
    expect(validateLevelDraft({ ...validDraft(), boardShape: { type: "GRID", cells: [{ row: 0, col: 0 }] } })).toContain(
      '`boardShape.type` must be "CELL_MASK".',
    );
    expect(validateLevelDraft({ ...validDraft(), boardShape: { type: "CELL_MASK", cells: [] } })).toContain(
      "`boardShape.cells` must be a non-empty array of {row, col} integers.",
    );
    expect(validateLevelDraft({ ...validDraft(), boardShape: 7 })).toContain(
      "`boardShape` must be an object.",
    );
  });

  it("reports a non-positive attempts and a non-positive timeLimit", () => {
    expect(validateLevelDraft({ ...validDraft(), attempts: 0 })).toContain(
      "`attempts` must be a positive integer.",
    );
    expect(validateLevelDraft({ ...validDraft(), attempts: 2.5 })).toContain(
      "`attempts` must be a positive integer.",
    );
    expect(validateLevelDraft({ ...validDraft(), timeLimit: -1 })).toContain(
      "`timeLimit` must be a positive number.",
    );
    expect(validateLevelDraft({ ...validDraft(), timeLimit: 0 })).toContain(
      "`timeLimit` must be a positive number.",
    );
    expect(validateLevelDraft({ ...validDraft(), timeLimit: 30 })).not.toContain(
      "`timeLimit` must be a positive number.",
    );
  });

  it("accumulates every violation instead of failing fast", () => {
    const errors = validateLevelDraft({ difficulty: "X", arrows: [] });
    expect(errors).toHaveLength(3);
    expect(errors).toEqual(
      expect.arrayContaining([
        "`name` is required and must be a non-empty string.",
        "`difficulty` must be one of EASY, MEDIUM, HARD.",
        "`arrows` is required and must be a non-empty array.",
      ]),
    );
  });
});
