import type { ArrowDirection, BoardCell } from "@/domain/board/BoardDefinition";
import { cellKey, type EditorArrow } from "./EditorArrow";
import { figureById } from "./boardFigures";
import type { EditorLevelModel } from "./EditorLevelModel";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

const DIRECTION_DELTA: Record<ArrowDirection, BoardCell> = {
  UP: { row: -1, col: 0 },
  DOWN: { row: 1, col: 0 },
  LEFT: { row: 0, col: -1 },
  RIGHT: { row: 0, col: 1 },
};

function areAdjacent(a: BoardCell, b: BoardCell): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

function validateArrow(
  arrow: EditorArrow,
  index: number,
  maskKeys: ReadonlySet<string> | null,
  errors: string[],
): void {
  const label = `arrow #${index + 1}`;
  if (arrow.path.length === 0) {
    errors.push(`${label}: path must have at least one cell.`);
    return;
  }

  if (maskKeys !== null && arrow.path.some((cell) => !maskKeys.has(cellKey(cell)))) {
    errors.push(`${label}: every cell must be inside the board figure.`);
  }

  const seen = new Set<string>();
  let selfCrosses = false;
  let disconnected = false;
  arrow.path.forEach((cell, cellIndex) => {
    const key = cellKey(cell);
    if (seen.has(key)) selfCrosses = true;
    seen.add(key);
    if (cellIndex > 0 && !areAdjacent(arrow.path[cellIndex - 1]!, cell)) disconnected = true;
  });
  if (selfCrosses) errors.push(`${label}: path must not cross itself.`);
  if (disconnected) errors.push(`${label}: path must be orthogonally connected.`);

  if (arrow.path.length >= 2) {
    const head = arrow.path[arrow.path.length - 1]!;
    const penultimate = arrow.path[arrow.path.length - 2]!;
    const delta = DIRECTION_DELTA[arrow.direction];
    if (head.row + delta.row === penultimate.row && head.col + delta.col === penultimate.col) {
      errors.push(`${label}: the arrow head must not point back into its body.`);
    }
  }
}

/**
 * Pure validation of the visual editor model. Accumulates a message per violation (empty =
 * valid): required name/difficulty/figure/arrows, unique ids, and — per arrow — containment
 * inside the chosen figure mask plus the ArrowSpec rules (connected, no self-crossing, head
 * not pointing into its own body). The server stays authoritative (it also checks solvability).
 */
export function validateEditorLevel(model: EditorLevelModel): string[] {
  const errors: string[] = [];

  if (model.name.trim() === "") {
    errors.push("`name` is required.");
  }
  if (!DIFFICULTIES.includes(model.difficulty)) {
    errors.push("`difficulty` must be one of EASY, MEDIUM, HARD.");
  }

  const figure = model.figureId !== null ? figureById(model.figureId) : undefined;
  if (figure === undefined) {
    errors.push("A board figure must be selected.");
  }

  if (model.arrows.length === 0) {
    errors.push("Add at least one arrow.");
  }

  const ids = model.arrows.map((arrow) => arrow.id);
  if (new Set(ids).size !== ids.length) {
    errors.push("Arrow ids must be unique.");
  }

  const maskKeys = figure !== undefined ? new Set(figure.cells.map(cellKey)) : null;
  model.arrows.forEach((arrow, index) => validateArrow(arrow, index, maskKeys, errors));

  return errors;
}
