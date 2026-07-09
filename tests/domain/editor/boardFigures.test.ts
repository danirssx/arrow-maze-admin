import { describe, expect, it } from "vitest";
import { BOARD_FIGURES, FIGURE_GRID_SIZE, figureById } from "@/domain/editor/boardFigures";
import { cellKey } from "@/domain/editor/EditorArrow";

describe("boardFigures", () => {
  it("exposes four figures with unique ids on a 5×5 grid", () => {
    expect(FIGURE_GRID_SIZE).toBe(5);
    const ids = BOARD_FIGURES.map((f) => f.id);
    expect(ids).toEqual(["SQUARE", "DIAMOND", "CROSS", "HEART"]);
    expect(new Set(ids).size).toBe(4);
  });

  it.each([
    ["SQUARE", 25],
    ["DIAMOND", 13],
    ["CROSS", 9],
    ["HEART", 16],
  ])("figure %s has %i mask cells", (id, count) => {
    expect(figureById(id)!.cells).toHaveLength(count);
  });

  it("places cells at the expected coordinates", () => {
    const cross = new Set(figureById("CROSS")!.cells.map(cellKey));
    expect(cross.has("2,0")).toBe(true); // arm of the cross
    expect(cross.has("2,2")).toBe(true); // center
    expect(cross.has("0,0")).toBe(false); // corner is empty
  });

  it("returns undefined for an unknown figure id", () => {
    expect(figureById("STAR")).toBeUndefined();
  });
});
