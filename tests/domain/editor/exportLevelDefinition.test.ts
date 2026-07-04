import { describe, expect, it } from "vitest";
import { figureById } from "@/domain/editor/boardFigures";
import type { EditorLevelModel } from "@/domain/editor/EditorLevelModel";
import { exportLevelDefinition } from "@/domain/editor/exportLevelDefinition";

const model: EditorLevelModel = {
  name: "Level",
  description: "d",
  difficulty: "MEDIUM",
  attempts: 6,
  figureId: "CROSS",
  arrows: [
    { id: "a", color: "cyan", direction: "RIGHT", path: [{ row: 2, col: 0 }, { row: 2, col: 1 }] },
  ],
};

describe("exportLevelDefinition", () => {
  it("exports the Phase-1 JSON with the figure as the boardShape CELL_MASK", () => {
    const json = exportLevelDefinition(model);
    expect(json).toEqual({
      name: "Level",
      description: "d",
      difficulty: "MEDIUM",
      attempts: 6,
      arrows: [
        { id: "a", color: "cyan", direction: "RIGHT", path: [{ row: 2, col: 0 }, { row: 2, col: 1 }] },
      ],
      boardShape: {
        type: "CELL_MASK",
        cells: figureById("CROSS")!.cells.map((c) => ({ row: c.row, col: c.col })),
      },
    });
  });

  it("omits boardShape when no figure is selected", () => {
    const json = exportLevelDefinition({ ...model, figureId: null });
    expect(json).not.toHaveProperty("boardShape");
    expect(json).toHaveProperty("arrows");
  });
});
