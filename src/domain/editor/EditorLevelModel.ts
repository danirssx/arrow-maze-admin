import type { BoardCell } from "@/domain/board/BoardDefinition";
import type { EditorArrow } from "./EditorArrow";
import type { BoardFigureId } from "./boardFigures";

/** How the board mask is authored: a fixed preset figure, or free-form custom cells. */
export type BoardAuthoringMode = "PRESET" | "CUSTOM";

/** The visual editor's working model (presentation state made testable in the domain). */
export interface EditorLevelModel {
  name: string;
  description: string;
  difficulty: string;
  attempts: number;
  mode: BoardAuthoringMode;
  figureId: BoardFigureId | null;
  /** Free-form mask cells used only in CUSTOM mode (duplicate-free). */
  customCells: BoardCell[];
  arrows: EditorArrow[];
}
