export type ArrowDirection = "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface BoardCell {
  row: number;
  col: number;
}

export interface BoardArrow {
  id: string;
  color: string;
  direction: ArrowDirection;
  /** Ordered cell chain tail → head (head is the last cell). */
  path: BoardCell[];
}

/** A parsed, render-ready level: its arrows plus the optional board mask cells. */
export interface BoardDefinition {
  arrows: BoardArrow[];
  /** Board mask cells (empty when the level has no `boardShape`). */
  shapeCells: BoardCell[];
}
