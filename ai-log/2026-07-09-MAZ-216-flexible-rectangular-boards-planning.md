# AI Usage Log: MAZ-216 flexible rectangular board definitions (admin planning)

## Task / Problem

Prepare the admin-side executable contract for `MAZ-216` / M12-04: allow non-preset
rectangular board definitions in admin level creation while enforcing M12 limits
(`12 x 12`, `60` arrows), preserving existing MAZ-205/206/207 behavior, and keeping
MAZ-211 irregular visual-editor masks out of this slice.

This is a planning/human-gate change only. No production code was written because no
approved MAZ-216 `.feature` contract existed before this session.

## Tool and Model

Codex CLI / GPT-5.

## Prompt Used

The user asked to start `MAZ-216`, following both repo `AGENTS.md` files, root
`MEMORY.md`, `Linear_MCP_Guideline.md`, new worktrees, AI usage logging,
`compile-ai-usage.sh`, checks, commit/push/PR/Linear, and to review affected tickets
because this is a refactor/factorization.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Distilled the Linear ticket and existing MAZ-205/206/207/211 contracts into a draft admin spec; no separate agent session was run. | `specs/flexible-rectangular-boards-MAZ-216.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Wrote the executable admin Gherkin scenarios `@s1..@s7` for the human gate. | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Not used | No TDD implementation was started because the MAZ-216 contract still needs human approval. | N/A |
| Judge (`.agents/judge.md`) | Referenced | Applied the Clean Architecture checklist to the proposed layer impact and forbidden moves. | this log + spec |
| Mutation Tester (`.agents/mutation.md`) | Not used | Mutation testing is not applicable to a contract-only planning change. | N/A |

## Scenario Coverage (@s -> evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` valid non-preset rectangle validates and previews | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s2` legacy JSON without `boardSize` keeps existing behavior | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s3` oversize dimensions rejected locally | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s4` more than 60 arrows rejected locally | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s5` arrow cells outside rectangle rejected locally | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s6` creator documents rectangular schema | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s7` backend rectangular validation errors surfaced | `specs/flexible-rectangular-boards-MAZ-216.feature` |

## Result Obtained

- Added `specs/flexible-rectangular-boards-MAZ-216.spec.md` with admin behavior,
  affected-ticket review, Clean Architecture placement, edge cases, and decisions.
- Added `specs/flexible-rectangular-boards-MAZ-216.feature` with `@s1..@s7`.
- Proposed `boardSize` as the admin rectangular authoring input and backend normalization
  to a full `CELL_MASK` `boardShape` for mobile compatibility.
- `npm run verify` green: lint, typecheck, coverage (`54` files / `230` tests), and build.

## Team Modifications Pending Human Review

- Human approval is required for the `@s1..@s7` contract before any TDD implementation.
- The team must confirm the `boardSize` request field name and the decision to normalize
  rectangular boards to `boardShape` for persistence/read.

## Lessons / Limitations

- Existing admin preview and validation are mask/arrow-bound based; rectangular empty cells
  require explicit dimensions in the contract.
- Existing mobile already renders `boardShape`, so normalized full rectangles avoid mobile
  work if the backend contract is approved as written.
