import { describe, expect, it } from "vitest";
import { figureById } from "@/domain/editor/boardFigures";
import type { EditorLevelModel } from "@/domain/editor/EditorLevelModel";
import {
  effectiveMaskCells,
  isCellInsideGrid,
  toggleMaskCell,
} from "@/domain/editor/boardMaskEditing";

function model(overrides: Partial<EditorLevelModel> = {}): EditorLevelModel {
  return {
    name: "Level",
    description: "d",
    difficulty: "EASY",
    attempts: 5,
    mode: "PRESET",
    figureId: "SQUARE",
    customCells: [],
    arrows: [],
    ...overrides,
  };
}

describe("toggleMaskCell", () => {
  it("adds a cell when it is absent", () => {
    expect(toggleMaskCell([], { row: 1, col: 2 })).toEqual([{ row: 1, col: 2 }]);
  });

  it("removes a cell when it is present", () => {
    const cells = [{ row: 1, col: 2 }, { row: 0, col: 0 }];
    expect(toggleMaskCell(cells, { row: 1, col: 2 })).toEqual([{ row: 0, col: 0 }]);
  });

  it("stays duplicate-free when toggling the same cell twice", () => {
    const once = toggleMaskCell([{ row: 0, col: 0 }], { row: 2, col: 2 });
    const twice = toggleMaskCell(once, { row: 2, col: 2 });
    expect(twice).toEqual([{ row: 0, col: 0 }]);
  });

  it("does not mutate the input array", () => {
    const cells = [{ row: 0, col: 0 }];
    toggleMaskCell(cells, { row: 1, col: 1 });
    expect(cells).toEqual([{ row: 0, col: 0 }]);
  });
});

describe("isCellInsideGrid", () => {
  it("accepts a cell inside the grid", () => {
    expect(isCellInsideGrid({ row: 0, col: 0 })).toBe(true);
  });

  it("rejects a negative cell", () => {
    expect(isCellInsideGrid({ row: -1, col: 0 })).toBe(false);
  });

  it("rejects a cell past the grid edge", () => {
    expect(isCellInsideGrid({ row: 0, col: 5 })).toBe(false);
  });
});

describe("effectiveMaskCells", () => {
  it("returns the preset figure cells in PRESET mode", () => {
    expect(effectiveMaskCells(model({ mode: "PRESET", figureId: "SQUARE" }))).toEqual(
      figureById("SQUARE")!.cells.map((c) => ({ row: c.row, col: c.col })),
    );
  });

  it("returns an empty mask in PRESET mode when no figure is selected", () => {
    expect(effectiveMaskCells(model({ mode: "PRESET", figureId: null }))).toEqual([]);
  });

  it("returns the custom cells in CUSTOM mode, ignoring the figure", () => {
    const custom = [{ row: 0, col: 0 }, { row: 4, col: 4 }];
    expect(
      effectiveMaskCells(model({ mode: "CUSTOM", figureId: "SQUARE", customCells: custom })),
    ).toEqual(custom);
  });
});
