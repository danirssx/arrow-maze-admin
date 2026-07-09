# Spec - Flexible rectangular board definitions in admin level creation (MAZ-216)

Date: 2026-07-09
Ticket: `MAZ-216`
Source: Linear `MAZ-216` / M12-04
Status: Backlog, draft for human gate. The `@s` scenarios in
`specs/flexible-rectangular-boards-MAZ-216.feature` must be approved before TDD.

## Purpose

Admins need to create levels on rectangular boards whose dimensions are not limited to
fixed presets. The JSON creator must accept an explicit rectangular `boardSize`, preview
the real rectangle, reject M12 limit violations locally, and submit only payloads that the
backend will authoritatively validate.

## In scope / Out of scope

- In scope: JSON creator validation for `boardSize`, rectangular preview from `boardSize`,
  maximum `12 x 12` dimensions, maximum `60` arrows, clear UI errors, and submission of the
  rectangular payload through the existing create/publish path.
- In scope: affected-ticket review for MAZ-205 preview, MAZ-206 JSON creator, MAZ-207
  create/publish route, and MAZ-211 visual editor boundaries.
- Out of scope: drag/drop board resizing, irregular/masked shape authoring for M12,
  mobile engine changes, backend persistence redesign, and changing existing visual-editor
  figure masks.

## Behavior

The admin JSON creator accepts this rectangular authoring field:

```json
{
  "boardSize": { "rows": 8, "cols": 10 }
}
```

Rules:

- `boardSize` is optional for backward compatibility with MAZ-206 JSON.
- When present, `rows` and `cols` must be positive integers.
- `rows <= 12` and `cols <= 12`.
- `arrows.length <= 60`.
- Every arrow path cell must be within `0 <= row < rows` and `0 <= col < cols`.
- The preview uses the full rectangle, including empty cells, not only arrow bounds.
- Irregular `boardShape` remains a previously approved backend/mobile concept, but this M12
  admin JSON flow uses `boardSize` for rectangular boards. It must not add a new irregular
  mask editor.

## Architecture placement (domain -> application -> presentation; inward-only deps)

- Domain: extend pure board parsing/validation with a `BoardSize` record type, M12 limits,
  and rectangle-bound checks.
- Application: `reviewLevelJson` and `toBoardPreview` continue to orchestrate validation
  and preview conversion; they may normalize `boardSize` to rectangle cells for preview.
- Infrastructure/Adapters: no direct change expected unless the existing admin API mapper
  needs to forward `boardSize`.
- Presentation (MVVM): creator screen/view-model shows inline `boardSize` and arrow-count
  errors; schema example documents rectangular JSON; no business rules in the view.
- Framework: no route architecture change expected; existing MAZ-207 route keeps wiring
  create/publish.

## Clean Architecture contract

- [x] Regla de dependencia (dependencies point inward only)
- [x] Independencia del dominio (no RN/Expo/storage/http/navigation in `src/domain`)
- [x] Application solo orquesta (no business rules, no infra/framework/presentation imports)
- [x] DTOs simples en fronteras (primitives/records, no raw domain entities/types)
- [x] Invariantes en VO/agregados (no en ViewModels/screens)
- [x] MVVM: View dumb, ViewModel solo presentación, streams/view state, composition root en framework

Layer impact:

- Domain: `src/domain/board/BoardDefinition.ts`, `parseBoardDefinition.ts`,
  `boardGeometry.ts`, `validateLevelDraft.ts`.
- Application: `src/application/board/reviewLevelJson.ts`,
  `src/application/board/toBoardPreview.ts`.
- Infrastructure/Adapters: existing level API adapter only if forwarding `boardSize` is not
  already transparent.
- Presentation (MVVM): `src/presentation/board/LevelCreatorViewModel.ts`,
  `LevelCreatorScreen.tsx`, `levelJsonSchemaExample.ts`.
- Framework: no previsto.

Forbidden moves:

- [ ] `src/domain` importing React/RN/Expo/storage/http/navigation
- [ ] `src/application` importing `infrastructure`/`framework`/`presentation`
- [ ] Views/screens containing business rules, framework side effects, or dependency composition
- [ ] ViewModels calculating scoring/progress/authorization/persistence or domain results
- [ ] DTOs to presentation re-exporting raw domain entities/types
- [ ] NativeWind/Zustand/svg/reanimated imported by `domain`/`application` or game-rule logic

Required tests:

- Domain: validation accepts non-preset rectangles; rejects oversize dimensions,
  too many arrows, and out-of-bounds arrow cells; parser/geometry builds full rectangles.
- Application: `reviewLevelJson` and `toBoardPreview` expose valid/invalid states and full
  rectangle preview data.
- Presentation/UI: screen shows schema, inline limit errors, preview, and disabled/enabled
  submit state.

Architecture acceptance criteria:

- Given the touched layers in this ticket, When imports are inspected, Then dependencies point inward only.
- Given `boardSize` crosses boundaries, When DTOs are inspected, Then they are simple records/primitives.
- Given board-size and arrow-count invariants are involved, When implementation is inspected, Then they live in pure domain/application validation, not screens/ViewModels.

## Edge cases

- Empty input remains neutral as in MAZ-206.
- Existing JSON without `boardSize` remains valid when it satisfies MAZ-206 rules.
- `boardSize` with `rows` or `cols` equal to zero, negative, fractional, missing, or non-number is invalid.
- A 12x12 board with 60 arrows is valid when all arrow cells are in bounds.
- A 13x12, 12x13, or 61-arrow payload is invalid.
- Arrow paths outside the declared rectangle are invalid even if they would preview from arrow bounds today.
- A malformed backend rejection is shown as a server error; local validation still blocks known M12 violations before submit.

## Acceptance criteria (Given/When/Then)

- S1: Given valid JSON with `boardSize: { rows: 8, cols: 10 }` and arrows inside that rectangle, When it is reviewed, Then it is valid, previewed as an 8x10 board, and submit is enabled.
- S2: Given valid legacy JSON without `boardSize`, When it is reviewed, Then existing MAZ-206 validation and preview behavior remain unchanged.
- S3: Given `boardSize` has rows or cols greater than 12, When it is reviewed, Then an inline limit error is shown and submit is disabled.
- S4: Given more than 60 arrows, When it is reviewed, Then an inline arrow-count error is shown and submit is disabled.
- S5: Given an arrow path cell outside the declared rectangle, When it is reviewed, Then an inline bounds error is shown and submit is disabled.
- S6: Given the creator screen, When it renders the schema example, Then `boardSize` and the M12 limits are visible.
- S7: Given the backend rejects a rectangular payload despite local validation, When submit completes with an error, Then the UI shows the backend message and does not show success.

## Decisions

- Use `boardSize` as the admin rectangular authoring input, not a new visual preset list.
  Reason: the ticket requires non-preset rectangles and explicit M12 limits.
- Backend should normalize a rectangular `boardSize` to a full `CELL_MASK` for persistence/read.
  Reason: mobile already supports `boardShape`, and this avoids a schema migration for MAZ-216.
- Existing MAZ-211 visual editor figure masks are not changed by this ticket.
  Reason: irregular masks are out of M12 scope and already belong to earlier shaped-board work.

## Risks / OPEN QUESTIONS

- Human gate must approve the `boardSize` input name and backend normalization to full
  `CELL_MASK` before implementation.
- If product wants mobile to receive `boardSize` instead of normalized `boardShape`, the
  scope expands to client mobile API mapping and rendering.
