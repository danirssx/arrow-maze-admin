# Spec — AD-05 Level creator: paste/upload JSON + shape validation + preview (MAZ-206)

## Problem

Admins need to author a level by pasting or uploading JSON, see a **live board preview**
(AD-04), and get **inline shape errors before submitting**. The expected JSON schema must be
shown. The actual server create→validate→publish is AD-06; this ticket delivers the creator
form, client-side shape validation, and the enabled/disabled submit affordance.

## Backend create contract (aligned, not called here)

`CreateLevelInput` (POST admin create, AD-06) = `{ name, description, difficulty, arrows,
attempts?, timeLimit?, boardShape? }`; `arrows[] = { id, color, direction, path:[{row,col}] }`;
`boardShape = { type:"CELL_MASK", cells:[{row,col}] }`; `difficulty ∈ EASY|MEDIUM|HARD`.

## Scope / Clean Architecture contract

| Layer | Impact |
| --- | --- |
| domain | `board/validateLevelDraft.ts` (pure: accumulates per-field shape errors for name/difficulty/arrows/boardShape/attempts/timeLimit → `string[]`, empty = valid) |
| application | `board/reviewLevelJson.ts` (`reviewLevelJson(text)` → `{ status: "empty"\|"syntax-error"\|"invalid"\|"valid", errors, value }`: JSON.parse + shape validation) |
| infrastructure | none |
| presentation | `board/LevelCreatorViewModel.ts` (MVVM: jsonText + review state, `setJsonText`/`loadFromText`/`submit`, `canSubmit`/`errors`/`previewSource`), `board/LevelCreatorScreen.tsx` (dumb: textarea + file upload + inline errors + expected-schema block + `BoardPreview` + submit), `board/levelJsonSchemaExample.ts` (help text) |
| framework | none (route wiring into the admin layout is AD-06) |

**Forbidden moves:** presentation must not import domain (validation reached via the
application `reviewLevelJson`; preview via AD-04's `toBoardPreview`); no business rules in the
view; no new top-level folders; no server call (AD-06). Reuses AD-04 `BoardPreview` for the
live preview.

**Architectural acceptance (judge gate):** dependency rule inward-only (eslint green);
`validateLevelDraft` pure + exhaustive; the VM holds only presentation state and delegates
validation; submit is gated on `status === "valid"`; `npm run verify` green; Stryker on
domain+application ≥ 80 (target 100).

## Acceptance criteria (from the ticket)

- Valid JSON → live preview + submit enabled.
- Malformed / missing → inline errors, submit disabled.
- The expected JSON schema is shown.
