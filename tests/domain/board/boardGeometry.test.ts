import { describe, expect, it } from "vitest";
import type { ArrowDirection, BoardDefinition } from "@/domain/board/BoardDefinition";
import { buildBoardGeometry } from "@/domain/board/boardGeometry";

const CELL = 34;

function singleCellArrow(direction: ArrowDirection): BoardDefinition {
  return {
    arrows: [{ id: "a", color: "cyan", direction, path: [{ row: 0, col: 0 }] }],
    shapeCells: [],
  };
}

describe("buildBoardGeometry", () => {
  it("normalizes cells relative to the minimum row/col and sizes the viewBox", () => {
    const def: BoardDefinition = {
      arrows: [
        {
          id: "a",
          color: "cyan",
          direction: "UP",
          path: [
            { row: 1, col: 2 },
            { row: 0, col: 2 },
          ],
        },
      ],
      shapeCells: [
        { row: 0, col: 2 },
        { row: 1, col: 2 },
      ],
    };

    const geometry = buildBoardGeometry(def, CELL);

    expect(geometry.width).toBe(34);
    expect(geometry.height).toBe(68);
    expect(geometry.cells).toEqual([
      { x: 0, y: 0, size: 34 },
      { x: 0, y: 34, size: 34 },
    ]);
    expect(geometry.arrows[0]!.points).toEqual([
      { x: 17, y: 51 },
      { x: 17, y: 17 },
    ]);
    expect(geometry.arrows[0]!.color).toBe("#3FC8FF");
  });

  it.each<[ArrowDirection, { x: number; y: number }[]]>([
    ["UP", [{ x: 17, y: 4 }, { x: 26, y: 17 }, { x: 8, y: 17 }]],
    ["DOWN", [{ x: 17, y: 30 }, { x: 8, y: 17 }, { x: 26, y: 17 }]],
    ["LEFT", [{ x: 4, y: 17 }, { x: 17, y: 8 }, { x: 17, y: 26 }]],
    ["RIGHT", [{ x: 30, y: 17 }, { x: 17, y: 26 }, { x: 17, y: 8 }]],
  ])("places the full head triangle pointing %s", (direction, head) => {
    expect(buildBoardGeometry(singleCellArrow(direction), CELL).arrows[0]!.head).toEqual(head);
  });

  it("spans min→max on both axes with a non-zero origin, regardless of cell order", () => {
    // max row (4) and max col (5) come from earlier cells, not the last one, and the
    // origin is non-zero — so this pins down the bounds + the origin subtraction.
    const def: BoardDefinition = {
      arrows: [
        { id: "a", color: "blue", direction: "RIGHT", path: [{ row: 2, col: 5 }] },
        { id: "b", color: "green", direction: "DOWN", path: [{ row: 4, col: 1 }] },
        { id: "c", color: "cyan", direction: "UP", path: [{ row: 2, col: 2 }] },
      ],
      shapeCells: [],
    };

    const geometry = buildBoardGeometry(def, CELL);

    expect(geometry.width).toBe(170);
    expect(geometry.height).toBe(102);
    expect(geometry.arrows[0]!.points).toEqual([{ x: 153, y: 17 }]);
    expect(geometry.arrows[1]!.points).toEqual([{ x: 17, y: 85 }]);
    expect(geometry.arrows[2]!.points).toEqual([{ x: 51, y: 17 }]);
  });

  it("emits no mask rects when there is no board shape", () => {
    const geometry = buildBoardGeometry(singleCellArrow("UP"), CELL);
    expect(geometry.cells).toEqual([]);
    expect(geometry.width).toBe(34);
    expect(geometry.height).toBe(34);
  });
});
