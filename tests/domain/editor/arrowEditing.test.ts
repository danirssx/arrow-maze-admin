import { describe, expect, it } from "vitest";
import { canAppendCell } from "@/domain/editor/arrowEditing";
import type { BoardCell } from "@/domain/board/BoardDefinition";

const mask = new Set(["0,0", "0,1", "0,2", "1,0", "1,1"]);

describe("canAppendCell", () => {
  it("appends any mask cell to an empty path", () => {
    expect(canAppendCell([], { row: 0, col: 0 }, mask)).toBe(true);
  });

  it("rejects a cell outside the mask", () => {
    expect(canAppendCell([], { row: 4, col: 4 }, mask)).toBe(false);
  });

  it("appends an orthogonally adjacent mask cell to the head", () => {
    const path: BoardCell[] = [{ row: 0, col: 0 }];
    expect(canAppendCell(path, { row: 0, col: 1 }, mask)).toBe(true);
  });

  it("rejects a non-adjacent cell", () => {
    const path: BoardCell[] = [{ row: 0, col: 0 }];
    expect(canAppendCell(path, { row: 0, col: 2 }, mask)).toBe(false);
  });

  it("rejects a cell already in the path", () => {
    const path: BoardCell[] = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
    expect(canAppendCell(path, { row: 0, col: 0 }, mask)).toBe(false);
  });

  it("rejects a diagonal neighbour", () => {
    const path: BoardCell[] = [{ row: 0, col: 0 }];
    expect(canAppendCell(path, { row: 1, col: 1 }, mask)).toBe(false);
  });
});
