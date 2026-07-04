import type { BoardCell } from "@/domain/board/BoardDefinition";

export type BoardFigureId = "SQUARE" | "DIAMOND" | "CROSS" | "HEART";

export interface BoardFigure {
  id: BoardFigureId;
  label: string;
  /** Mask cells (row/col) that make up the figure on a 5×5 grid. */
  cells: BoardCell[];
}

/** Grid side every figure is authored on. */
export const FIGURE_GRID_SIZE = 5;

/** ASCII → cells: an "X" marks a mask cell at that row/col. */
function cellsFromPattern(rows: readonly string[]): BoardCell[] {
  const cells: BoardCell[] = [];
  rows.forEach((row, r) => {
    [...row].forEach((char, c) => {
      if (char === "X") cells.push({ row: r, col: c });
    });
  });
  return cells;
}

export const BOARD_FIGURES: readonly BoardFigure[] = [
  {
    id: "SQUARE",
    label: "Square",
    cells: cellsFromPattern(["XXXXX", "XXXXX", "XXXXX", "XXXXX", "XXXXX"]),
  },
  {
    id: "DIAMOND",
    label: "Diamond",
    cells: cellsFromPattern(["..X..", ".XXX.", "XXXXX", ".XXX.", "..X.."]),
  },
  {
    id: "CROSS",
    label: "Cross",
    cells: cellsFromPattern(["..X..", "..X..", "XXXXX", "..X..", "..X.."]),
  },
  {
    id: "HEART",
    label: "Heart",
    cells: cellsFromPattern([".X.X.", "XXXXX", "XXXXX", ".XXX.", "..X.."]),
  },
];

export function figureById(id: string): BoardFigure | undefined {
  return BOARD_FIGURES.find((figure) => figure.id === id);
}
