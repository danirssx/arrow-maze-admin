# Spec — AD-04 Read-only web board preview (MAZ-205)

## Problem

The admin needs to see a level's board (arrows + board mask) without the game engine: a
pure React SVG component that renders a `LevelDefinition` read-only (no interaction),
reusable by the JSON creator (AD-05) and a level detail. Rendering must degrade gracefully
on invalid JSON (no crash). No shared engine — a lightweight, self-contained geometry port.

## Backend data shape (mirrored, not imported)

A level JSON (from `prisma/seed-data/level-json/*.json`):
- `arrows: [{ id: string, color: string, direction: "UP"|"DOWN"|"LEFT"|"RIGHT",
  path: [{ row: int, col: int }, …] }]` — `path` is an orthogonally-connected cell chain,
  the head is the last cell, `direction` points outward from the head.
- `boardShape?: { type: "CELL_MASK", cells: [{ row: int, col: int }, …] }` — an optional
  visual cell mask.
- `row` is the vertical axis (down-positive), `col` the horizontal (right-positive).

## Scope / Clean Architecture contract

| Layer | Impact |
| --- | --- |
| domain | `board/BoardDefinition.ts` (types), `board/parseBoardDefinition.ts` (pure guard → `BoardDefinition \| null`), `board/resolveArrowColor.ts` (pure safe CSS colour), `board/boardGeometry.ts` (pure `buildBoardGeometry(def, cellSize)` → rects + arrow polylines + head triangles + viewBox) |
| application | `board/toBoardPreview.ts` (`toBoardPreview(raw, cellSize)` → `BoardGeometry \| null`; orchestrates parse + geometry) |
| infrastructure | none |
| presentation | `board/BoardPreview.tsx` (dumb SVG: renders the geometry, or a graceful fallback when null) |
| framework | none |

**Forbidden moves:** presentation must not import domain (geometry reached via the
application `toBoardPreview`); geometry stays pure (no React/SVG DOM in domain); no shared
game engine; no new top-level folders.

**Architectural acceptance (judge gate):** dependency rule inward-only (eslint green); the
geometry + parse are pure and unit-tested; `BoardPreview` holds no rules and never throws on
bad input; `npm run verify` green; Stryker on domain+application ≥ 80 (target 100).

## Acceptance criteria (from the ticket)

- Renders arrows (colour, direction, path) + the boardShape mask.
- Renders from parsed JSON; on invalid JSON it degrades without crashing.
