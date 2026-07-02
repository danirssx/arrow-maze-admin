import type { ArrowDirection, BoardCell, BoardDefinition } from "./BoardDefinition";
import { resolveArrowColor } from "./resolveArrowColor";

export interface Point {
  x: number;
  y: number;
}

export interface GeometryCell {
  x: number;
  y: number;
  size: number;
}

export interface GeometryArrow {
  id: string;
  color: string;
  /** Cell centers tail → head (the arrow body polyline). */
  points: Point[];
  /** Three-point arrowhead triangle at the head, pointing in the arrow direction. */
  head: Point[];
}

export interface BoardGeometry {
  width: number;
  height: number;
  cellSize: number;
  cells: GeometryCell[];
  arrows: GeometryArrow[];
}

/** Arrowhead sizing (absolute px, mirrors the client's NeonArrow HEAD_LEN/HEAD_HALF). */
export const HEAD_LENGTH = 13;
export const HEAD_HALF_WIDTH = 9;

const DIRECTION_UNIT: Record<ArrowDirection, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

/** Three-point arrowhead triangle at `center`, pointing along `direction`. */
function headTriangle(center: Point, direction: ArrowDirection): Point[] {
  const dir = DIRECTION_UNIT[direction];
  const perp: Point = { x: -dir.y, y: dir.x };
  const tip: Point = { x: center.x + dir.x * HEAD_LENGTH, y: center.y + dir.y * HEAD_LENGTH };
  const baseA: Point = { x: center.x + perp.x * HEAD_HALF_WIDTH, y: center.y + perp.y * HEAD_HALF_WIDTH };
  const baseB: Point = { x: center.x - perp.x * HEAD_HALF_WIDTH, y: center.y - perp.y * HEAD_HALF_WIDTH };
  return [tip, baseA, baseB];
}

/**
 * Pure geometry for a read-only board: maps a `BoardDefinition` onto an SVG grid. Cells are
 * placed relative to the minimum row/col so the drawing is tight; each arrow becomes a
 * polyline of cell centers plus a head triangle. Frame-free (no SVG/React), so it is unit
 * testable. Callers reach this via the application `toBoardPreview`.
 */
export function buildBoardGeometry(definition: BoardDefinition, cellSize: number): BoardGeometry {
  const allCells: BoardCell[] = [
    ...definition.shapeCells,
    ...definition.arrows.flatMap((arrow) => arrow.path),
  ];

  let minRow = Infinity;
  let minCol = Infinity;
  let maxRow = -Infinity;
  let maxCol = -Infinity;
  for (const cell of allCells) {
    minRow = Math.min(minRow, cell.row);
    minCol = Math.min(minCol, cell.col);
    maxRow = Math.max(maxRow, cell.row);
    maxCol = Math.max(maxCol, cell.col);
  }

  const originX = (col: number): number => (col - minCol) * cellSize;
  const originY = (row: number): number => (row - minRow) * cellSize;
  const center = (cell: BoardCell): Point => ({
    x: originX(cell.col) + cellSize / 2,
    y: originY(cell.row) + cellSize / 2,
  });

  const cells: GeometryCell[] = definition.shapeCells.map((cell) => ({
    x: originX(cell.col),
    y: originY(cell.row),
    size: cellSize,
  }));

  const arrows: GeometryArrow[] = definition.arrows.map((arrow) => {
    const points = arrow.path.map(center);
    const headCenter = points[points.length - 1]!;
    return {
      id: arrow.id,
      color: resolveArrowColor(arrow.color),
      points,
      head: headTriangle(headCenter, arrow.direction),
    };
  });

  return {
    width: (maxCol - minCol + 1) * cellSize,
    height: (maxRow - minRow + 1) * cellSize,
    cellSize,
    cells,
    arrows,
  };
}
