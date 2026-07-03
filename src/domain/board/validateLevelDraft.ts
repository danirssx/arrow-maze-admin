const DIRECTIONS = ["UP", "DOWN", "LEFT", "RIGHT"];
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isPositiveNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isCell(value: unknown): boolean {
  return isRecord(value) && Number.isInteger(value.row) && Number.isInteger(value.col);
}

function isCellArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every(isCell);
}

function validateArrow(arrow: unknown, index: number, errors: string[]): void {
  const label = `arrow #${index + 1}`;
  if (!isRecord(arrow)) {
    errors.push(`${label} must be an object.`);
    return;
  }
  if (!isNonEmptyString(arrow.id)) errors.push(`${label}: \`id\` must be a non-empty string.`);
  if (!isNonEmptyString(arrow.color)) errors.push(`${label}: \`color\` must be a non-empty string.`);
  if (typeof arrow.direction !== "string" || !DIRECTIONS.includes(arrow.direction)) {
    errors.push(`${label}: \`direction\` must be one of UP, DOWN, LEFT, RIGHT.`);
  }
  if (!isCellArray(arrow.path)) {
    errors.push(`${label}: \`path\` must be a non-empty array of {row, col} integers.`);
  }
}

function validateBoardShape(shape: unknown, errors: string[]): void {
  if (!isRecord(shape)) {
    errors.push("`boardShape` must be an object.");
    return;
  }
  if (shape.type !== "CELL_MASK") errors.push('`boardShape.type` must be "CELL_MASK".');
  if (!isCellArray(shape.cells)) {
    errors.push("`boardShape.cells` must be a non-empty array of {row, col} integers.");
  }
}

/**
 * Pure client-side shape validation for an authored level JSON. Accumulates a message per
 * violation (does not fail fast) so the creator can show every problem at once; an empty
 * result means the shape is valid. Mirrors the backend create contract (name, difficulty,
 * arrows/ArrowSpec, optional boardShape/attempts/timeLimit); the server remains authoritative.
 */
export function validateLevelDraft(raw: unknown): string[] {
  if (!isRecord(raw)) return ["Level JSON must be an object."];

  const errors: string[] = [];

  if (!isNonEmptyString(raw.name)) {
    errors.push("`name` is required and must be a non-empty string.");
  }
  if (typeof raw.difficulty !== "string" || !DIFFICULTIES.includes(raw.difficulty)) {
    errors.push("`difficulty` must be one of EASY, MEDIUM, HARD.");
  }
  if (!Array.isArray(raw.arrows) || raw.arrows.length === 0) {
    errors.push("`arrows` is required and must be a non-empty array.");
  } else {
    raw.arrows.forEach((arrow, index) => validateArrow(arrow, index, errors));
  }
  if (raw.boardShape !== undefined) {
    validateBoardShape(raw.boardShape, errors);
  }
  if (raw.attempts !== undefined && !isPositiveInteger(raw.attempts)) {
    errors.push("`attempts` must be a positive integer.");
  }
  if (raw.timeLimit !== undefined && !isPositiveNumber(raw.timeLimit)) {
    errors.push("`timeLimit` must be a positive number.");
  }

  return errors;
}
