import type { ArrowDirection, BoardCell } from "@/domain/board/BoardDefinition";

export interface EditorArrow {
  id: string;
  color: string;
  direction: ArrowDirection;
  /** Ordered cell chain tail → head (head is the last cell). */
  path: BoardCell[];
}

/** Author-selectable colours (names the preview/game palette resolves — see resolveArrowColor). */
export const ARROW_COLORS = [
  "cyan",
  "blue",
  "green",
  "yellow",
  "pink",
  "purple",
  "orange",
  "teal",
] as const;

export const ARROW_DIRECTIONS: readonly ArrowDirection[] = ["UP", "DOWN", "LEFT", "RIGHT"];

export function cellKey(cell: BoardCell): string {
  return `${cell.row},${cell.col}`;
}
