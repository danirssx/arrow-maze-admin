# AI Usage Log: MAZ-222 free-form custom board mask painter (admin planning)

## Task / Problem

Prepare the admin-side executable contract for `MAZ-222` / M12-09: add a free-form custom
board mask mode to the visual editor so admins can author irregular board shapes instead of
being limited to the 4 preset figures (SQUARE, DIAMOND, CROSS, HEART). This is the follow-up to
MAZ-216 (M12-04), whose Decision + Out-of-scope explicitly deferred the "full visual editor" and
"irregular masked boardShape" authoring.

This is a planning/human-gate change only. No production code was written, because no approved
MAZ-222 `.feature` contract exists yet.

## Root-cause note (why MAZ-216 did not satisfy the request)

MAZ-216 was scoped to **rectangular** boards authored via the JSON creator; the visual editor's
preset figure system was left untouched by design. The export/persistence contract already emits
`boardShape: CELL_MASK` (DIAMOND/CROSS/HEART are already irregular masks) and the create-level
backend already accepts it, so custom-shape authoring is admin presentation + admin domain
validation work — no backend/mobile change expected.

## Tool and Model

Claude Code / claude-opus-4-8 (1M context).

## Prompt Used

The user asked to evaluate MAZ-216 (felt the solution was insufficient — wants to draw a custom
board shape in the visual editor), and, after the evaluation, to create the follow-up ticket:
draft the spec + Gherkin in a new worktree, leave a draft PR, and file the Linear ticket in
Backlog for approval, following both repo `AGENTS.md` files, root `MEMORY.md`,
`Linear_MCP_Guideline.md`, worktree-per-ticket, AI usage logging, and commit/push/PR/Linear.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Read the current editor (`boardFigures`, `EditorLevelModel`, `validateEditorLevel`, `exportLevelDefinition`, `LevelEditorViewModel`, `LevelEditorScreen`) and MAZ-216/211 contracts; distilled the draft spec with decisions and open questions. No separate agent session was run. | `specs/free-form-custom-board-mask-MAZ-222.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Wrote the executable Gherkin `@s1..@s8` for the human gate and filed the Backlog ticket. | `specs/free-form-custom-board-mask-MAZ-222.feature`, Linear `MAZ-222` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Not used | No TDD implementation started; the contract needs human approval first. | N/A |
| Judge (`.agents/judge.md`) | Referenced | Applied the Clean Architecture checklist to the proposed layer impact and forbidden moves. | this log + spec `## Clean Architecture contract` |
| Mutation Tester (`.agents/mutation.md`) | Not used | Not applicable to a contract-only planning change. | N/A |

## Scenario Coverage (@s -> evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` empty custom mask is invalid | `specs/free-form-custom-board-mask-MAZ-222.feature` |
| `@s2` toggling cells builds the board + previews custom shape | `specs/free-form-custom-board-mask-MAZ-222.feature` |
| `@s3` toggling a cell off flags an arrow that used it | `specs/free-form-custom-board-mask-MAZ-222.feature` |
| `@s4` disconnected custom mask allowed (connectivity not enforced) | `specs/free-form-custom-board-mask-MAZ-222.feature` |
| `@s5` valid mask exports CELL_MASK of exactly the painted cells | `specs/free-form-custom-board-mask-MAZ-222.feature` |
| `@s6` selecting a preset seeds the editable custom mask | `specs/free-form-custom-board-mask-MAZ-222.feature` |
| `@s7` valid custom level publishes through the existing flow | `specs/free-form-custom-board-mask-MAZ-222.feature` |
| `@s8` backend rejection surfaced | `specs/free-form-custom-board-mask-MAZ-222.feature` |

## Result Obtained

- Added `specs/free-form-custom-board-mask-MAZ-222.spec.md` (behavior, effective-mask model,
  Clean Architecture contract, edge cases, decisions, open questions).
- Added `specs/free-form-custom-board-mask-MAZ-222.feature` with `@s1..@s8`.
- Filed Linear `MAZ-222` (M12-09) in Backlog with the embedded Clean Architecture contract.
- No production code changed; no `src/` touched.

## Open questions — resolved 2026-07-10 (human)

The human accepted the proposals; verification then reversed one of them:

1. Connectivity — **not enforced** (reversed from the initial "require connected region"
   proposal). Verifying the backend showed `BoardShape` deliberately allows disconnected islands
   ("so abstract disconnected islands remain authorable"); enforcing connectivity in the admin
   would contradict that intent and add a needless rule. `@s4` was flipped from reject → allow.
2. Grid size — **keep the fixed authoring grid**; variable dimensions up to 12x12 deferred.
3. Presets — **seed-and-edit** (`@s6`).
4. Backend — **confirmed, no backend change**. `CreateLevelUseCase.mapBoardShapeInput` →
   `BoardShape.create` accepts an arbitrary CELL_MASK (`type` + `cells`), invariants non-empty /
   duplicate-free / `<= 600` cells; solvability ignores the mask (unbounded raycast). Evidence in
   `arrow-maze-backend/src/application/level-catalog/use-cases/CreateLevelUseCase.ts` and
   `.../domain/level-catalog/value-objects/BoardShape.ts`.

## Team Modifications Pending Human Review

- Explicit human "aprobado" of the `@s1..@s8` contract (and moving the ticket out of Backlog) is
  still required before any TDD implementation.

## Lessons / Limitations

- The persistence/export contract already supports irregular CELL_MASK; the only real gap was
  the authoring UI offering fixed presets — so "any shape" is mostly a presentation + domain
  validation slice, not a cross-repo change.
- Keeping grid size fixed keeps this an independent tracer bullet; combining it with MAZ-216's
  variable dimensions would couple two features and is deferred as an open question.
