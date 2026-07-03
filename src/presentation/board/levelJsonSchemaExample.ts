/** The expected level-JSON shape, shown in the creator as authoring help. */
export const LEVEL_JSON_SCHEMA_EXAMPLE = `{
  "name": "My Level",
  "description": "A short description",
  "difficulty": "EASY | MEDIUM | HARD",
  "attempts": 5,
  "arrows": [
    {
      "id": "a",
      "color": "cyan",
      "direction": "UP | DOWN | LEFT | RIGHT",
      "path": [{ "row": 1, "col": 0 }, { "row": 0, "col": 0 }]
    }
  ],
  "boardShape": {
    "type": "CELL_MASK",
    "cells": [{ "row": 0, "col": 0 }, { "row": 1, "col": 0 }]
  }
}`;
