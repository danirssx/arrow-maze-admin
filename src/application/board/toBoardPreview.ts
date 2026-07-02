import type { BoardGeometry } from "@/domain/board/boardGeometry";
import { buildBoardGeometry } from "@/domain/board/boardGeometry";
import { parseBoardDefinition } from "@/domain/board/parseBoardDefinition";

export type { BoardGeometry } from "@/domain/board/boardGeometry";

export const DEFAULT_PREVIEW_CELL_SIZE = 34;

/**
 * Turns an untrusted level JSON value into render-ready board geometry, or `null` when the
 * JSON is not a valid definition. Orchestrates the domain parse + geometry so the
 * presentation gets a ready-to-draw model without importing domain.
 */
export function toBoardPreview(
  raw: unknown,
  cellSize: number = DEFAULT_PREVIEW_CELL_SIZE,
): BoardGeometry | null {
  const definition = parseBoardDefinition(raw);
  if (definition === null) return null;
  return buildBoardGeometry(definition, cellSize);
}
