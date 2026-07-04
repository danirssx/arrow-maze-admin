/**
 * Application facade for the visual editor: re-exports the domain editor primitives the
 * presentation needs (figures, colours, directions, paint rule, export) so the view/VM never
 * import domain directly (keeps the dependency rule inward-only).
 */
export { BOARD_FIGURES, FIGURE_GRID_SIZE, figureById } from "@/domain/editor/boardFigures";
export type { BoardFigure, BoardFigureId } from "@/domain/editor/boardFigures";
export { ARROW_COLORS, ARROW_DIRECTIONS, cellKey } from "@/domain/editor/EditorArrow";
export type { EditorArrow } from "@/domain/editor/EditorArrow";
export { canAppendCell } from "@/domain/editor/arrowEditing";
export { exportLevelDefinition } from "@/domain/editor/exportLevelDefinition";
export type { EditorLevelModel } from "@/domain/editor/EditorLevelModel";
export type { ArrowDirection, BoardCell } from "@/domain/board/BoardDefinition";
