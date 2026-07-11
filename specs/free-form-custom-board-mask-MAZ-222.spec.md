# Spec — Free-form custom board mask painter in the admin visual editor (MAZ-222)

Date: 2026-07-10
Ticket: `MAZ-222` (M12-09)
Source: Linear `MAZ-222` / follow-up to MAZ-216 (M12-04) out-of-scope "irregular masked boardShape" + "full visual editor"
Status: Backlog. Open questions resolved by the human on 2026-07-10 (see Resolved decisions).
The `@s1..@s8` scenarios in `specs/free-form-custom-board-mask-MAZ-222.feature` still need the
explicit human "aprobado" (and the ticket moved out of Backlog) before TDD begins.

## Purpose

Admins are currently locked to 4 fixed preset figures (SQUARE, DIAMOND, CROSS, HEART) in the
visual editor and cannot author a custom-shaped board. This slice adds a **free-form custom
board mask** mode: the admin toggles individual grid cells in/out to define the board shape,
paints arrows inside it, and publishes. It exports the same `boardShape: CELL_MASK` contract the
backend and mobile already honor (DIAMOND/CROSS/HEART are already irregular masks), so no
backend or mobile change is expected.

## In scope / Out of scope

- In scope: a "Custom" authoring mode in the visual editor; toggling grid cells to build the
  board mask; domain validation of the custom mask (non-empty, in-bounds, single connected
  region); arrows constrained to the effective mask (existing rule); live preview of the custom
  shape; inline errors before publish; export as `boardShape: CELL_MASK` through the existing
  create/publish path.
- In scope: presets remain and, when picked in custom mode, seed the mask as an editable
  starting template.
- Out of scope: variable board dimensions / grid resizing (MAZ-216 rectangular territory;
  separate follow-up unless approved at the gate); backend or mobile changes if CELL_MASK is
  already honored; any new create/publish use case, route, or GoF pattern; irregular-mask
  authoring anywhere other than the visual editor.

## Behavior

The visual editor gains a board authoring mode selector:

- `PRESET` (existing): pick one of `BOARD_FIGURES`; its cells are the mask.
- `CUSTOM` (new): start from an empty mask on the same authoring grid; clicking a grid cell
  toggles it in/out of the board mask. Selecting a preset while in `CUSTOM` seeds the mask with
  that figure's cells, which the admin may then edit.

The **effective mask** is: the preset figure cells in `PRESET` mode, or the painted custom cells
in `CUSTOM` mode. Everything downstream (arrow painting containment, preview, export) uses the
effective mask, so arrow rules and export are unchanged in shape.

Domain invariants for the effective mask (enumerated):

- The mask must contain at least one cell.
- Every mask cell must be within the authoring grid bounds (`0 <= row < FIGURE_GRID_SIZE`,
  `0 <= col < FIGURE_GRID_SIZE`).
- Mask cells are duplicate-free (toggling is idempotent by cell key).
- Connectivity is intentionally **not** enforced: disconnected islands are allowed. This aligns
  the admin with the backend `BoardShape` VO, whose header states connectivity is deliberately
  not enforced "so abstract disconnected islands remain authorable"
  (`arrow-maze-backend/src/domain/level-catalog/value-objects/BoardShape.ts`).
- Every arrow path cell must be inside the effective mask (existing rule, now over the custom
  mask).
- Existing ArrowSpec rules are unchanged: path connected, no self-crossing, head not pointing
  into its own body; unique arrow ids; required name/difficulty; at least one arrow.

## Architecture placement (domain → application → presentation; inward-only deps)

- Domain owns the board mask model + all mask invariants and the export. Presentation only holds
  authoring mode + the cell-toggle intent and renders the derived view state. The View stays
  dumb; the ViewModel holds no rules.

## Clean Architecture contract

Applicable rules from `docs/reglas_clean_arch.md` (judge verifies each PASS/FAIL with
`file:line`):

- [x] Regla de dependencia (dependencies point inward only)
- [x] Independencia del dominio (no React/DOM/http/storage/navigation in `src/domain`)
- [x] Application solo orquesta (no business rules; re-exports domain primitives via the
      `editorCatalog` facade)
- [x] DTOs simples en fronteras (`BoardCell` records / CELL_MASK cells, no raw domain entities)
- [x] Invariantes en dominio (mask non-empty/in-bounds/duplicate-free + arrow containment live in
      pure domain, not the ViewModel/View)
- [x] MVVM: View dumb (mode toggle + cell toggle intents), ViewModel presentation-only,
      composition root unchanged in framework

Layer impact:

- Domain: extend `src/domain/editor/EditorLevelModel.ts` (authoring mode + custom mask cells);
  new pure `src/domain/editor/boardMaskEditing.ts` (toggle cell in/out, duplicate-free),
  analogous to the existing `arrowEditing.ts`; extend
  `src/domain/editor/validateEditorLevel.ts` and `src/domain/editor/exportLevelDefinition.ts`
  to compute over the effective mask; `boardFigures.ts` unchanged (may add a seed helper).
- Application: `src/application/editor/editorCatalog.ts` re-exports the new primitives;
  `reviewEditorLevel.ts` keeps its shape.
- Infrastructure/Adapters: no previsto.
- Presentation (MVVM): `src/presentation/editor/LevelEditorViewModel.ts` (set authoring mode,
  toggle mask cell, derive effective mask); `src/presentation/editor/LevelEditorScreen.tsx`
  (mode toggle + mask-paint interaction; grid paints mask in CUSTOM, arrows as today).
- Framework: no previsto (`AdminLevelEditorRoute.tsx` unchanged; reuses MAZ-206/207
  create→publish).

Forbidden moves (must stay unchecked / not introduced):

- [ ] `src/domain` importing React/DOM/http/storage/navigation
- [ ] `src/application` importing `infrastructure`/`framework`/`presentation`
- [ ] Views/screens containing mask/arrow invariants, export rules, or dependency composition
- [ ] ViewModels calculating mask validity / export / persistence or domain results
- [ ] DTOs to presentation re-exporting raw domain entities/types
- [ ] New use case / route / GoF pattern introduced without approval

Required tests:

- Domain: toggle adds/removes a mask cell (idempotent, duplicate-free); empty mask rejected;
  out-of-bounds cell rejected; a disconnected mask is accepted (no connectivity rule); effective-
  mask arrow containment (arrow outside custom mask rejected); export emits `CELL_MASK` with
  exactly the custom cells; preset seeding produces the figure's cells as an editable mask.
- Application: `reviewEditorLevel` returns valid/invalid + exported value for custom masks.
- Presentation/UI: mode toggle switches authoring; clicking a cell in CUSTOM paints/erases the
  mask; inline errors render; preview reflects the custom shape; publish enabled only when valid.

Architecture acceptance criteria:

- Given the touched layers, When imports are inspected, Then dependencies point inward only.
- Given the custom mask crosses boundaries, When DTOs are inspected, Then they are simple
  `BoardCell` records / CELL_MASK cells.
- Given mask/arrow invariants are involved, When implementation is inspected, Then they live in
  pure domain, not the screen/ViewModel.

## Edge cases

- Empty custom mask → neutral-but-invalid: inline "select at least one board cell", publish
  disabled.
- Toggling off a cell an arrow uses → the existing containment rule flags that arrow; publish
  disabled until fixed.
- Disconnected mask (two islands) → allowed (valid), matching the backend `BoardShape` VO that
  deliberately permits disconnected islands.
- Switching PRESET → CUSTOM seeds from the current preset (or empty if none); switching back is
  allowed and does not silently drop authored arrows that still fit the mask.
- Single-cell mask is valid (connected, non-empty) if arrows still satisfy ArrowSpec.
- Backend rejects a locally valid custom payload → surface the backend message; no success shown
  (mirrors existing editor server-error handling).

## Acceptance criteria (Given/When/Then)

- S1: Given custom mode with an empty mask, When reviewed, Then an inline "select at least one
  board cell" error is shown and publish is disabled.
- S2: Given custom mode, When the author toggles cells on, Then those cells become the board, are
  paintable, and the preview renders the custom shape.
- S3: Given a custom mask cell that is currently on, When the author toggles it off, Then it
  leaves the mask, and any arrow that used it is flagged and publish is disabled.
- S4: Given a custom mask whose cells form two disconnected islands with otherwise valid arrows,
  When reviewed, Then it is valid and publish is enabled (connectivity is not enforced, matching
  the backend).
- S5: Given a valid custom mask with valid arrows, When exported, Then the payload carries
  `boardShape: { type: "CELL_MASK", cells }` with exactly the painted cells.
- S6: Given a preset is selected while in custom mode, When it seeds the mask, Then the mask holds
  that figure's cells and the author can further toggle cells.
- S7: Given a valid custom level, When published, Then it is created and published through the
  existing create/publish path and the backend stays authoritative.
- S8: Given the backend rejects a locally valid custom payload, When submit completes with an
  error, Then the backend message is shown and no success is shown.

## Decisions

- Author the custom board as a painted `CELL_MASK`, reusing the existing export/persistence
  contract. Reason: DIAMOND/CROSS/HEART already persist as irregular CELL_MASK and the backend
  create-level path already accepts it; this avoids backend/mobile changes and a schema
  migration. Discarded: a new "arbitrary polygon"/pixel format — needs new contracts on three
  repos for no added value.
- Keep presets and add CUSTOM as a mode; presets seed the custom mask. Reason: least destructive,
  keeps quick-start templates, matches the user's real need ("draw a custom shape"). Discarded:
  removing presets (regresses MAZ-211) or a fully separate parallel editor (duplication).
- Keep the current fixed authoring grid for this slice. Reason: independent tracer bullet; the
  user's blocker is shape freedom, not size. Discarded: folding in 12x12 variable dimensions —
  couples to MAZ-216 rectangular work; deferred to a follow-up.
- Do **not** enforce mask connectivity; allow disconnected islands. Reason: the backend
  `BoardShape` VO deliberately does not enforce connectivity "so abstract disconnected islands
  remain authorable"; enforcing it in the only authoring tool would defeat that intent and add a
  needless domain rule. Discarded: requiring a single connected region (would make the admin
  stricter than the backend and block intended abstract boards).

## Resolved decisions (were open questions; human approved 2026-07-10)

1. Connectivity — **not enforced**; disconnected islands are allowed (S4). Reversed from the
   initial proposal after verifying the backend `BoardShape` VO deliberately permits disconnected
   islands; enforcing connectivity in the admin would contradict that intent.
2. Grid size — **keep the current fixed authoring grid** this slice. Variable dimensions up to
   12x12 (MAZ-216 envelope) are a separate follow-up.
3. Preset interaction — **seed-and-edit** (S6): selecting a preset seeds an editable custom mask.
4. Backend — **confirmed, no backend change**. `CreateLevelUseCase` accepts an arbitrary
   `boardShape` CELL_MASK (`type` + `cells`) via `mapBoardShapeInput` → `BoardShape.create`, with
   invariants non-empty / duplicate-free / `<= BOARD_SHAPE_MAX_CELLS` (600); the 5x5 admin grid is
   far under the cap. Solvability (`LevelSolvabilityPolicy`) uses an unbounded raycast and ignores
   the mask, so disconnected islands do not affect solvability. Evidence:
   `arrow-maze-backend/src/application/level-catalog/use-cases/CreateLevelUseCase.ts`,
   `arrow-maze-backend/src/domain/level-catalog/value-objects/BoardShape.ts`.

## Residual risks

- The admin grid is fixed to `FIGURE_GRID_SIZE`; large custom boards need the deferred
  variable-dimensions follow-up.
