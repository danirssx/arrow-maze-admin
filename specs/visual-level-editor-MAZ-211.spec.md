# Spec — AD-10 [Phase 2] Visual level editor + figure picker (MAZ-211)

## Problem

Beyond pasting JSON (Phase 1 / AD-05/06), admins want to author a level visually: paint
arrows on a grid, pick a board figure (a mask = `boardShape`), and publish. The output is the
**same `LevelDefinition` JSON as Phase 1**, so it reuses AD-06's create→publish. The backend
validates the same (ArrowSpec/containment/solvability).

## Scope decision (spec-partner)

The ticket's acceptance is a draft and lists open items "to debate". This delivers a complete,
tested MVP and **defers** the explicitly-optional items:

- **In scope:** figure/mask catalog (square, diamond, cross, heart); click-to-paint an arrow
  path (orthogonal, inside the mask, no self-intersection); pick direction + colour; add/delete
  arrows; **live containment + ArrowSpec validation** (domain); export to the Phase-1 JSON; live
  preview (AD-04); publish via AD-06.
- **Deferred (documented):** undo/redo, drag-paint, in-place arrow *move* (use delete + repaint),
  **live solvability** (the server validates the DAG at publish — the source of truth), and an
  extended figure library. "Move" is satisfied by delete-then-repaint.

## Scope / Clean Architecture contract

| Layer | Impact |
| --- | --- |
| domain | `editor/boardFigures.ts` (mask catalog + `figureById`), `editor/EditorArrow.ts` (types + `ARROW_COLORS`, `ARROW_DIRECTIONS`), `editor/arrowEditing.ts` (pure paint rules: `canAppendCell`), `editor/validateEditorLevel.ts` (pure: name/difficulty/figure/arrows + containment + connectivity + self-intersection + head-not-into-body + unique ids → `string[]`), `editor/exportLevelDefinition.ts` (pure: model → Phase-1 JSON) |
| application | `editor/reviewEditorLevel.ts` (`reviewEditorLevel(model)` → `{ valid, errors, value }`: validate + export) |
| infrastructure | none (reuses AD-06 `HttpAdminLevelApi.create`/`publish`) |
| presentation | `editor/LevelEditorViewModel.ts` (MVVM: model + draft path + selected dir/colour + review), `editor/LevelEditorScreen.tsx` (dumb: figure picker, grid, dir/colour pickers, arrow list, inline errors, AD-04 preview, publish) |
| framework | `editor/AdminLevelEditorRoute.tsx` (wires publish via AD-06 `createAndPublishUseCase`); `/levels/new/visual` route; `LevelsView` gains an optional `onCreateVisual` action |

**Forbidden moves:** all validation rules live in domain/application, never the view (the view
is dumb); presentation reaches validation/export via the application `reviewEditorLevel`, and the
preview via AD-04's `toBoardPreview`; the server remains authoritative (client only gives live
feedback); no new top-level folders; reuses AD-06 publish + AD-04 preview.

**Architectural acceptance (judge gate):** dependency rule inward-only (eslint green); figures,
paint rules, validation and export are pure + unit-tested; the VM holds only presentation state;
publish reuses AD-06; `npm run verify` green; Stryker on domain+application ≥ 80 (target ~100).

## Acceptance criteria (from the ticket)

- Paint/delete arrows; choose direction and colour.
- Choose the board figure (mask catalog) → sets `boardShape`; arrows contained in the mask
  (live feedback).
- Export JSON equivalent to Phase 1; live preview (AD-04); publish via AD-06.
- Validation rules in domain/application (not the view).
