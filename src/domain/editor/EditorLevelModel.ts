import type { EditorArrow } from "./EditorArrow";
import type { BoardFigureId } from "./boardFigures";

/** The visual editor's working model (presentation state made testable in the domain). */
export interface EditorLevelModel {
  name: string;
  description: string;
  difficulty: string;
  attempts: number;
  figureId: BoardFigureId | null;
  arrows: EditorArrow[];
}
