import { exportLevelDefinition } from "@/domain/editor/exportLevelDefinition";
import type { EditorLevelModel } from "@/domain/editor/EditorLevelModel";
import { validateEditorLevel } from "@/domain/editor/validateEditorLevel";

export interface EditorReview {
  valid: boolean;
  errors: string[];
  /** The exported Phase-1 JSON when valid, otherwise null. */
  value: Record<string, unknown> | null;
}

/**
 * Reviews the visual editor model: validates (containment + ArrowSpec rules + required meta)
 * and, when valid, exports the Phase-1 JSON ready for AD-06's create→publish. Orchestrates the
 * domain rules so the presentation stays dumb and never imports domain.
 */
export function reviewEditorLevel(model: EditorLevelModel): EditorReview {
  const errors = validateEditorLevel(model);
  if (errors.length > 0) {
    return { valid: false, errors, value: null };
  }
  return { valid: true, errors: [], value: exportLevelDefinition(model) };
}
