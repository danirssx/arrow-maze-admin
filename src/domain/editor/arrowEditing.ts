import type { BoardCell } from "@/domain/board/BoardDefinition";
import { cellKey } from "./EditorArrow";

function areOrthogonallyAdjacent(a: BoardCell, b: BoardCell): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

/**
 * Pure paint rule: whether `cell` may extend the arrow `path` under the figure `mask`. A cell
 * is appendable when it is inside the mask, not already in the path, and — for a non-empty
 * path — orthogonally adjacent to the current head. This drives live painting feedback.
 */
export function canAppendCell(
  path: readonly BoardCell[],
  cell: BoardCell,
  maskKeys: ReadonlySet<string>,
): boolean {
  if (!maskKeys.has(cellKey(cell))) return false;
  if (path.some((step) => cellKey(step) === cellKey(cell))) return false;
  if (path.length === 0) return true;
  return areOrthogonallyAdjacent(path[path.length - 1]!, cell);
}
