import type { BoardCell } from "@/domain/board/BoardDefinition";
import { cellKey } from "./EditorArrow";
import { FIGURE_GRID_SIZE, figureById } from "./boardFigures";
import type { EditorLevelModel } from "./EditorLevelModel";

/**
 * Pure board-mask editing for the free-form CUSTOM authoring mode. The mask is a duplicate-free
 * set of lattice cells that frames the board and constrains where arrows may be placed.
 * Connectivity is intentionally NOT enforced: disconnected islands are allowed, matching the
 * backend `BoardShape` value object, so abstract disconnected boards remain authorable.
 */

/** Whether a cell is inside the fixed authoring grid. */
export function isCellInsideGrid(cell: BoardCell): boolean {
  return (
    cell.row >= 0 && cell.row < FIGURE_GRID_SIZE && cell.col >= 0 && cell.col < FIGURE_GRID_SIZE
  );
}

/** Toggle a cell in/out of a mask: remove it if present, else append it. Idempotent by key. */
export function toggleMaskCell(cells: readonly BoardCell[], cell: BoardCell): BoardCell[] {
  const key = cellKey(cell);
  if (cells.some((existing) => cellKey(existing) === key)) {
    return cells.filter((existing) => cellKey(existing) !== key);
  }
  return [...cells.map((c) => ({ row: c.row, col: c.col })), { row: cell.row, col: cell.col }];
}

/** The cells that make up the board for the current authoring mode. */
export function effectiveMaskCells(model: EditorLevelModel): BoardCell[] {
  if (model.mode === "CUSTOM") {
    return model.customCells.map((cell) => ({ row: cell.row, col: cell.col }));
  }
  const figure = model.figureId !== null ? figureById(model.figureId) : undefined;
  return figure !== undefined ? figure.cells.map((cell) => ({ row: cell.row, col: cell.col })) : [];
}
