# AI Usage Log: MAZ-216 flexible rectangular board definitions (admin implementation)

## Task / Problem

Implement the approved MAZ-216 admin contract after human approval of the planning PR:
the JSON creator accepts rectangular `boardSize`, validates M12 limits locally, previews the
full rectangle including empty cells, updates the schema help text, and preserves existing
legacy `boardShape` behavior where applicable.

## Tool and Model

Codex CLI / GPT-5.

## Prompt Used

The user confirmed the MAZ-216 planning PRs were approved and asked to continue with
the ticket implementation, still following `AGENTS.md`, the TDD gate, AI logging,
checks, commit/push/PR, Linear, and MEMORY updates.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Used the approved MAZ-216 admin spec to keep M12 rectangles separate from MAZ-211 irregular masks. | `specs/flexible-rectangular-boards-MAZ-216.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Implemented against the approved `@s1..@s7` Gherkin scenarios. | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Added failing tests first for validator, parser, preview, review orchestration, and schema UI; then implemented pure domain/application/presentation changes. | tests listed below |
| Judge (`.agents/judge.md`) | Referenced | Checked layer placement: pure domain validation/parse, application orchestration unchanged, dumb presentation schema text only. | `npm run verify` |
| Mutation Tester (`.agents/mutation.md`) | Referenced | Ran focused Stryker mutation on touched domain files; no separate mutation-agent session was run. | mutation score below |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` valid non-preset rectangle validates and previews | `validateLevelDraft.test should_accept_board_size_when_dimensions_and_arrows_are_within_limits`, `parseBoardDefinition.test should_parse_board_size_as_full_rectangle_mask_cells`, `toBoardPreview.test should_preview_the_full_rectangle_when_board_size_is_present` |
| `@s2` legacy JSON without `boardSize` keeps existing behavior | existing `validateLevelDraft`, `parseBoardDefinition`, and `toBoardPreview` legacy tests |
| `@s3` oversize dimensions rejected locally | `validateLevelDraft.test should_report_board_size_errors_when_dimensions_exceed_m12_limits`, `reviewLevelJson.test should_report_invalid_when_board_size_exceeds_m12_limits` |
| `@s4` more than 60 arrows rejected locally | `validateLevelDraft.test should_report_arrow_count_error_when_more_than_sixty_arrows_are_defined` |
| `@s5` arrow cells outside rectangle rejected locally | `validateLevelDraft.test should_report_bounds_error_when_arrow_cell_is_outside_board_size` |
| `@s6` creator documents rectangular schema | `LevelCreatorScreen.test always shows the expected schema` |
| `@s7` backend errors are surfaced | existing `LevelCreatorScreen.test shows a server error and blocks submit while a request is in flight` |

## Result Obtained

- `validateLevelDraft` now validates optional `boardSize`, rejects mixed `boardSize` +
  `boardShape`, enforces `12 x 12`, enforces max `60` arrows, and checks arrow path bounds.
- `parseBoardDefinition` now turns `boardSize` into full rectangle mask cells for preview and
  rejects malformed or mixed rectangular/masked input.
- `toBoardPreview` now previews full rectangular dimensions via the parsed rectangle cells.
- `levelJsonSchemaExample` documents `boardSize` and the M12 limits.

## Verification

- Focused red/green tests: `npm test -- tests/domain/board/validateLevelDraft.test.ts tests/domain/board/parseBoardDefinition.test.ts tests/application/board/toBoardPreview.test.ts tests/application/board/reviewLevelJson.test.ts tests/presentation/board/LevelCreatorScreen.test.tsx` -> `5` files / `58` tests green.
- Full gate: `npm run verify` -> GREEN (`54` files / `240` tests, lint, typecheck, coverage, build).
- Mutation: `npm run mutation -- --mutate src/domain/board/parseBoardDefinition.ts,src/domain/board/validateLevelDraft.ts` -> `86.65%` (break threshold `80%`).

## Team Modifications Pending Human Review

- Existing MAZ-211 visual editor still exports `boardShape` masks. This implementation leaves
  that path unchanged; MAZ-216 rectangular JSON authoring uses `boardSize`.

## Lessons / Limitations

- The preview already rendered masks, so the cleanest admin implementation is to translate
  `boardSize` into rectangle mask cells before geometry.
- Several Stryker survivors are redundant guard mutations around generic JSON shape checks;
  the focused score remains above the required threshold.
