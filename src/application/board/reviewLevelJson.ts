import { validateLevelDraft } from "@/domain/board/validateLevelDraft";

export type LevelJsonStatus = "empty" | "syntax-error" | "invalid" | "valid";

export interface LevelJsonReview {
  status: LevelJsonStatus;
  errors: string[];
  /** The parsed JSON value (present once the text parses; null on empty/syntax errors). */
  value: unknown;
}

/**
 * Reviews raw creator text: empty → `empty`; unparseable → `syntax-error`; parsed but
 * shape-invalid → `invalid` (with per-field errors); otherwise `valid`. Orchestrates the
 * JSON parse and the domain shape validation so the presentation gets a ready view model.
 */
export function reviewLevelJson(text: string): LevelJsonReview {
  if (text.trim() === "") {
    return { status: "empty", errors: [], value: null };
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : "could not parse JSON";
    return { status: "syntax-error", errors: [`Invalid JSON: ${message}`], value: null };
  }

  const errors = validateLevelDraft(value);
  if (errors.length > 0) {
    return { status: "invalid", errors, value };
  }
  return { status: "valid", errors: [], value };
}
