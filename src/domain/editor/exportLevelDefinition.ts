import { effectiveMaskCells } from "./boardMaskEditing";
import type { EditorLevelModel } from "./EditorLevelModel";

/**
 * Pure export of the editor model to the Phase-1 `LevelDefinition` JSON (the exact shape the
 * paste-JSON creator produces), so the visual editor reuses AD-06's create→publish unchanged.
 * The effective mask (preset figure or free-form custom cells) becomes the `boardShape`
 * CELL_MASK; when there is no mask, `boardShape` is omitted.
 */
export function exportLevelDefinition(model: EditorLevelModel): Record<string, unknown> {
  const base: Record<string, unknown> = {
    name: model.name,
    description: model.description,
    difficulty: model.difficulty,
    attempts: model.attempts,
    arrows: model.arrows.map((arrow) => ({
      id: arrow.id,
      color: arrow.color,
      direction: arrow.direction,
      path: arrow.path.map((cell) => ({ row: cell.row, col: cell.col })),
    })),
  };

  const cells = effectiveMaskCells(model);
  if (cells.length === 0) return base;
  return {
    ...base,
    boardShape: {
      type: "CELL_MASK",
      cells: cells.map((cell) => ({ row: cell.row, col: cell.col })),
    },
  };
}
