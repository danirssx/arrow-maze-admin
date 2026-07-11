# AI Usage Log: MAZ-222 free-form custom board mask painter (admin implementation)

## Task / Problem

Implement `MAZ-222` / M12-09 after the human approved the `@s1..@s8` Gherkin contract: add a
free-form CUSTOM board authoring mode to the admin visual editor so admins can paint an irregular
board mask (not only the 4 preset figures), paint arrows inside it, and publish via the existing
create/publish path. Exports the same `boardShape: CELL_MASK` contract; no backend/mobile change.

## Tool and Model

Claude Code / claude-opus-4-8 (1M context).

## Prompt Used

The user evaluated MAZ-216, approved creating the follow-up MAZ-222, resolved the four open
questions with the proposed answers, and then gave the explicit "aprobado" for the Gherkin
contract, authorizing the TDD implementation.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Spec authored in the planning session; not re-run. | `specs/free-form-custom-board-mask-MAZ-222.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | `@s1..@s8` contract from planning; `@s4` flipped after backend verification. | `specs/free-form-custom-board-mask-MAZ-222.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Test-first domain→application→presentation; effective-mask model + pure `boardMaskEditing`; existing fixtures updated for the new required fields. | tests + `src/domain/editor/*`, `src/presentation/editor/*` |
| Judge (`.agents/judge.md`) | Referenced | Kept the dependency rule inward-only (presentation imports the `editorCatalog` facade, never domain); no new use case/route/pattern. | `src/application/editor/editorCatalog.ts` |
| Mutation Tester (`.agents/mutation.md`) | Used | Scoped Stryker on the new/changed domain files. | `ai-log/2026-07-10-MAZ-222-mutation.md` (score below) |

## Scenario Coverage (@s -> test)

| Scenario | Test evidence |
| --- | --- |
| `@s1` empty custom mask invalid | `validateEditorLevel.test.ts` "requires at least one custom board cell (@s1)"; `LevelEditorViewModel.test.ts` "cannot publish with an empty custom mask (@s1)" |
| `@s2` toggling cells builds the board + preview | `LevelEditorScreen.test.tsx` "paints a custom board shape and publishes its CELL_MASK (@s2, @s7)" |
| `@s3` toggling a cell off flags an arrow that used it | `validateEditorLevel.test.ts` "reports an arrow that leaves the custom mask (@s3)" |
| `@s4` disconnected mask allowed | `validateEditorLevel.test.ts` "allows a disconnected custom mask (@s4)"; `LevelEditorViewModel.test.ts` "allows publishing a disconnected custom mask (@s4)" |
| `@s5` export CELL_MASK of exactly the painted cells | `exportLevelDefinition.test.ts` "exports the custom cells as the boardShape CELL_MASK (@s5)" |
| `@s6` preset seeds the editable mask | `LevelEditorViewModel.test.ts` "seeds the custom mask from the selected preset..." / "...while already in CUSTOM mode (@s6)" |
| `@s7` publish through the existing flow | `LevelEditorViewModel.test.ts` "builds and publishes a custom-shaped level... (@s5, @s7)"; `LevelEditorScreen.test.tsx` (@s2, @s7) |
| `@s8` backend rejection surfaced | `LevelEditorScreen.test.tsx` "shows domain validation errors and a server error" (unchanged server-error path reused) |

## Result Obtained

- Domain: `EditorLevelModel` gains `mode: "PRESET" | "CUSTOM"` + `customCells`; new pure
  `boardMaskEditing.ts` (`toggleMaskCell`, `isCellInsideGrid`, `effectiveMaskCells`);
  `validateEditorLevel` and `exportLevelDefinition` now operate over the effective mask; no
  connectivity rule (aligns with backend `BoardShape`).
- Application: `editorCatalog` re-exports the new primitives + `BoardAuthoringMode`.
- Presentation: `LevelEditorViewModel` adds `setMode`/`setMaskEditing`/`toggleMaskCell` and
  seed-on-`selectFigure`; `LevelEditorScreen` adds the mode selector, an Edit-board/Paint-arrows
  toggle, and mask-toggling grid clicks in CUSTOM mode.
- `npm run verify` GREEN: lint + typecheck + coverage (55 files / 264 tests) + build.
- Scoped mutation on the new domain files: see score in `ai-log/2026-07-10-MAZ-222-mutation.md`.

## Team Modifications Pending Human Review

- Domain/application tests are subject to mandatory human review.
- Follow-up (deferred): variable board dimensions up to 12x12 in the visual editor.

## Lessons / Limitations

- Verifying the backend `BoardShape` VO before coding prevented shipping a connectivity rule that
  would have contradicted the backend's deliberate "disconnected islands remain authorable"
  design; `@s4` was flipped from reject to allow.
- The authoring grid remains fixed to `FIGURE_GRID_SIZE`; large custom boards need the deferred
  variable-dimensions follow-up.
