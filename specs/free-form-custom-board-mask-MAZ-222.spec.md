# Spec — Free-form custom board mask painter in the admin visual editor (MAZ-222)

Date: 2026-07-10
Ticket: `MAZ-222` (M12-09)
Source: Linear `MAZ-222` / follow-up to MAZ-216 (M12-04) out-of-scope "irregular masked boardShape" + "full visual editor"
Status: Backlog, draft for the human gate. The `@s` scenarios in
`specs/free-form-custom-board-mask-MAZ-222.feature` must be approved before TDD.

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
- The mask must be a single orthogonally-connected region (no disconnected islands) — proposed;
  see OPEN QUESTION 1.
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
- [x] Invariantes en dominio (mask non-empty/in-bounds/connected + arrow containment live in
      pure domain, not the ViewModel/View)
- [x] MVVM: View dumb (mode toggle + cell toggle intents), ViewModel presentation-only,
      composition root unchanged in framework

Layer impact:

- Domain: extend `src/domain/editor/EditorLevelModel.ts` (authoring mode + custom mask cells);
  new pure `src/domain/editor/boardMaskEditing.ts` (toggle cell, connectivity check),
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

- Domain: toggle adds/removes a mask cell; connectivity accepts a connected region and rejects a
  disconnected island; empty mask rejected; out-of-bounds cell rejected; effective-mask arrow
  containment (arrow outside custom mask rejected); export emits `CELL_MASK` with exactly the
  custom cells; preset seeding produces the figure's cells as an editable mask.
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
- Disconnected mask (two islands) → connectivity error; publish disabled (per OPEN QUESTION 1).
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
- S4: Given a custom mask with a disconnected island, When reviewed, Then an inline connectivity
  error is shown and publish is disabled.
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
  couples to MAZ-216 rectangular work; offered as OPEN QUESTION 2.

## Risks / OPEN QUESTIONS

1. Connectivity — require a single orthogonally-connected region (proposed, S4) or allow
   arbitrary cell sets? A connected board matches every existing figure and avoids degenerate
   islands, but adds a domain rule + test.
2. Grid size — keep the current fixed authoring grid this slice (proposed) or fold in variable
   dimensions up to 12x12 (MAZ-216 envelope) now? If folded in, scope grows to size controls +
   in-bounds re-derivation and should reuse MAZ-216's `boardSize` limits.
3. Preset interaction — seed-and-edit (proposed, S6) vs. presets and custom as fully separate,
   non-seeding modes?
4. Backend confirmation — confirm the create-level endpoint accepts an arbitrary CELL_MASK within
   the M12 envelope and validates solvability (expected yes; no backend change). If it assumes a
   preset/rectangle, a small backend slice is added.
