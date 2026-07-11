/** The expected level-JSON shape, shown in the creator as authoring help. */
export const LEVEL_JSON_SCHEMA_EXAMPLE = `Rectangular board limits: 12 x 12 max, 60 arrows max.
Do not combine boardSize with boardShape.

{
  "name": "My Level",
  "description": "A short description",
  "difficulty": "EASY | MEDIUM | HARD",
  "attempts": 5,
  "boardSize": { "rows": 8, "cols": 10 },
  "arrows": [
    {
      "id": "a",
      "color": "cyan",
      "direction": "UP | DOWN | LEFT | RIGHT",
      "path": [{ "row": 1, "col": 0 }, { "row": 0, "col": 0 }]
    }
  ]
}`;
