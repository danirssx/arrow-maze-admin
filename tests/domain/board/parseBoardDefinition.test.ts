import { describe, expect, it } from "vitest";
import { parseBoardDefinition } from "@/domain/board/parseBoardDefinition";

const validArrow = {
  id: "a",
  color: "cyan",
  direction: "UP",
  path: [
    { row: 1, col: 2 },
    { row: 0, col: 2 },
  ],
};

function validRaw(): unknown {
  return {
    arrows: [validArrow],
    boardShape: { type: "CELL_MASK", cells: [{ row: 0, col: 2 }] },
  };
}

describe("parseBoardDefinition", () => {
  it("parses arrows and board mask cells from a valid definition", () => {
    const def = parseBoardDefinition(validRaw());
    expect(def).not.toBeNull();
    expect(def!.arrows).toHaveLength(1);
    expect(def!.arrows[0]).toEqual({
      id: "a",
      color: "cyan",
      direction: "UP",
      path: [
        { row: 1, col: 2 },
        { row: 0, col: 2 },
      ],
    });
    expect(def!.shapeCells).toEqual([{ row: 0, col: 2 }]);
  });

  it("defaults to no mask cells when boardShape is absent", () => {
    const def = parseBoardDefinition({ arrows: [validArrow] });
    expect(def).not.toBeNull();
    expect(def!.shapeCells).toEqual([]);
  });

  it("should_parse_board_size_as_full_rectangle_mask_cells", () => {
    const def = parseBoardDefinition({ arrows: [validArrow], boardSize: { rows: 2, cols: 3 } });

    expect(def).not.toBeNull();
    expect(def!.shapeCells).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ]);
  });

  it.each(["UP", "DOWN", "LEFT", "RIGHT"])("accepts the %s direction", (direction) => {
    const def = parseBoardDefinition({ arrows: [{ ...validArrow, direction }] });
    expect(def).not.toBeNull();
    expect(def!.arrows[0]!.direction).toBe(direction);
  });

  it("rejects a non-object value", () => {
    expect(parseBoardDefinition(null)).toBeNull();
    expect(parseBoardDefinition(42)).toBeNull();
  });

  it("rejects a missing or empty arrows array", () => {
    expect(parseBoardDefinition({})).toBeNull();
    expect(parseBoardDefinition({ arrows: [] })).toBeNull();
    expect(parseBoardDefinition({ arrows: "no" })).toBeNull();
  });

  it("rejects an arrow with a missing or empty id", () => {
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, id: "" }] })).toBeNull();
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, id: "  " }] })).toBeNull();
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, id: 3 }] })).toBeNull();
  });

  it("rejects an arrow with an empty, whitespace or non-string colour", () => {
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, color: "" }] })).toBeNull();
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, color: "   " }] })).toBeNull();
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, color: 7 }] })).toBeNull();
  });

  it("rejects a path whose cells are not objects", () => {
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, path: [5] }] })).toBeNull();
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, path: [{ row: 0, col: 1.5 }] }] })).toBeNull();
  });

  it("rejects an unknown direction", () => {
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, direction: "SIDEWAYS" }] })).toBeNull();
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, direction: 1 }] })).toBeNull();
  });

  it("rejects an empty or non-integer arrow path", () => {
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, path: [] }] })).toBeNull();
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, path: [{ row: 0.5, col: 1 }] }] })).toBeNull();
    expect(parseBoardDefinition({ arrows: [{ ...validArrow, path: [{ row: 0 }] }] })).toBeNull();
  });

  it("rejects a malformed boardShape", () => {
    expect(parseBoardDefinition({ arrows: [validArrow], boardShape: "x" })).toBeNull();
    expect(parseBoardDefinition({ arrows: [validArrow], boardShape: { cells: [] } })).toBeNull();
    expect(
      parseBoardDefinition({ arrows: [validArrow], boardShape: { cells: [{ row: 0, col: "a" }] } }),
    ).toBeNull();
  });

  it("should_reject_a_malformed_board_size", () => {
    expect(parseBoardDefinition({ arrows: [validArrow], boardSize: { rows: 0, cols: 3 } })).toBeNull();
    expect(parseBoardDefinition({ arrows: [validArrow], boardSize: { rows: 2, cols: 13 } })).toBeNull();
  });

  it("should_reject_combined_board_size_and_board_shape", () => {
    expect(
      parseBoardDefinition({
        arrows: [validArrow],
        boardSize: { rows: 2, cols: 3 },
        boardShape: { type: "CELL_MASK", cells: [{ row: 0, col: 0 }] },
      }),
    ).toBeNull();
  });
});
