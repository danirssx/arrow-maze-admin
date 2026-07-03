import type { ArrowDirection, BoardArrow, BoardCell, BoardDefinition } from "./BoardDefinition";

const DIRECTIONS: readonly ArrowDirection[] = ["UP", "DOWN", "LEFT", "RIGHT"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseCell(value: unknown): BoardCell | null {
  if (!isRecord(value)) return null;
  const { row, col } = value;
  if (!Number.isInteger(row) || !Number.isInteger(col)) return null;
  return { row: row as number, col: col as number };
}

function parseCells(value: unknown): BoardCell[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const cells: BoardCell[] = [];
  for (const item of value) {
    const cell = parseCell(item);
    if (cell === null) return null;
    cells.push(cell);
  }
  return cells;
}

function parseArrow(value: unknown): BoardArrow | null {
  if (!isRecord(value)) return null;
  const { id, color, direction, path } = value;
  if (typeof id !== "string" || id.trim() === "") return null;
  if (typeof color !== "string" || color.trim() === "") return null;
  if (typeof direction !== "string" || !DIRECTIONS.includes(direction as ArrowDirection)) return null;
  const cells = parseCells(path);
  if (cells === null) return null;
  return { id, color, direction: direction as ArrowDirection, path: cells };
}

/**
 * Pure, defensive parse of an untrusted level JSON value into a render-ready
 * `BoardDefinition`, or `null` when the shape is invalid (so the preview degrades instead
 * of crashing). `arrows` is required (non-empty, each valid); `boardShape` is optional but,
 * when present, must be a valid cell mask.
 */
export function parseBoardDefinition(raw: unknown): BoardDefinition | null {
  if (!isRecord(raw)) return null;

  if (!Array.isArray(raw.arrows) || raw.arrows.length === 0) return null;
  const arrows: BoardArrow[] = [];
  for (const item of raw.arrows) {
    const arrow = parseArrow(item);
    if (arrow === null) return null;
    arrows.push(arrow);
  }

  let shapeCells: BoardCell[] = [];
  if (raw.boardShape !== undefined) {
    if (!isRecord(raw.boardShape)) return null;
    const cells = parseCells(raw.boardShape.cells);
    if (cells === null) return null;
    shapeCells = cells;
  }

  return { arrows, shapeCells };
}
