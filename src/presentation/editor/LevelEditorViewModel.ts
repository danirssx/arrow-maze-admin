import {
  ARROW_COLORS,
  ARROW_DIRECTIONS,
  canAppendCell,
  cellKey,
  effectiveMaskCells,
  exportLevelDefinition,
  figureById,
  toggleMaskCell,
  type ArrowDirection,
  type BoardAuthoringMode,
  type BoardCell,
  type BoardFigureId,
  type EditorLevelModel,
} from "@/application/editor/editorCatalog";
import { reviewEditorLevel, type EditorReview } from "@/application/editor/reviewEditorLevel";
import { ObservableViewModel } from "@/presentation/view-models/ObservableViewModel";

export interface LevelEditorUiState {
  model: EditorLevelModel;
  draftPath: BoardCell[];
  selectedDirection: ArrowDirection;
  selectedColor: string;
  /** In CUSTOM mode, whether grid clicks toggle mask cells (true) or paint arrows (false). */
  maskEditing: boolean;
  review: EditorReview;
}

function initialModel(): EditorLevelModel {
  return {
    name: "",
    description: "Created with the visual editor",
    difficulty: "EASY",
    attempts: 5,
    mode: "PRESET",
    figureId: null,
    customCells: [],
    arrows: [],
  };
}

function figureCells(figureId: BoardFigureId): BoardCell[] {
  const figure = figureById(figureId);
  return figure !== undefined ? figure.cells.map((cell) => ({ row: cell.row, col: cell.col })) : [];
}

/**
 * MVVM ViewModel for the visual editor. Holds the editing model, the in-progress draft path,
 * and the selected direction/colour; derives validation + the exported JSON from the
 * application layer. It holds no rules — containment/ArrowSpec live in domain. Publish emits
 * the exported value (only when valid); the backend is authoritative.
 */
export class LevelEditorViewModel extends ObservableViewModel<LevelEditorUiState> {
  private arrowCounter = 0;

  constructor(private readonly onPublish: (value: unknown) => void) {
    const model = initialModel();
    super({
      model,
      draftPath: [],
      selectedDirection: ARROW_DIRECTIONS[0]!,
      selectedColor: ARROW_COLORS[0],
      maskEditing: false,
      review: reviewEditorLevel(model),
    });
  }

  private commitModel(model: EditorLevelModel): void {
    this.setState({ ...this.getState(), model, review: reviewEditorLevel(model) });
  }

  setName(name: string): void {
    this.commitModel({ ...this.getState().model, name });
  }

  setDifficulty(difficulty: string): void {
    this.commitModel({ ...this.getState().model, difficulty });
  }

  setDirection(direction: ArrowDirection): void {
    this.setState({ ...this.getState(), selectedDirection: direction });
  }

  setColor(color: string): void {
    this.setState({ ...this.getState(), selectedColor: color });
  }

  selectFigure(figureId: BoardFigureId): void {
    const state = this.getState();
    // In CUSTOM mode a figure seeds the editable mask (seed-and-edit); in PRESET it is the mask.
    const customCells = state.model.mode === "CUSTOM" ? figureCells(figureId) : state.model.customCells;
    const model = { ...state.model, figureId, customCells };
    // Reset the in-progress draft: its cells may no longer be inside the new mask.
    this.setState({ ...state, model, draftPath: [], review: reviewEditorLevel(model) });
  }

  /** Switch the board authoring mode. Entering CUSTOM seeds from the current preset if empty. */
  setMode(mode: BoardAuthoringMode): void {
    const state = this.getState();
    let { customCells } = state.model;
    if (mode === "CUSTOM" && customCells.length === 0 && state.model.figureId !== null) {
      customCells = figureCells(state.model.figureId);
    }
    const model = { ...state.model, mode, customCells };
    this.setState({
      ...state,
      model,
      draftPath: [],
      maskEditing: mode === "CUSTOM",
      review: reviewEditorLevel(model),
    });
  }

  /** Toggle whether grid clicks edit the board mask (CUSTOM only) or paint arrows. */
  setMaskEditing(maskEditing: boolean): void {
    this.setState({ ...this.getState(), maskEditing, draftPath: [] });
  }

  /** Add/remove a cell from the free-form custom mask (CUSTOM mode only). */
  toggleMaskCell(cell: BoardCell): void {
    const state = this.getState();
    if (state.model.mode !== "CUSTOM") return;
    const model = { ...state.model, customCells: toggleMaskCell(state.model.customCells, cell) };
    this.setState({ ...state, model, draftPath: [], review: reviewEditorLevel(model) });
  }

  private maskKeys(): ReadonlySet<string> {
    return new Set(effectiveMaskCells(this.getState().model).map(cellKey));
  }

  /** Click a grid cell: remove it if it is the draft head (undo), else append if allowed. */
  paintCell(cell: BoardCell): void {
    const state = this.getState();
    const path = state.draftPath;
    const head = path[path.length - 1];
    if (head !== undefined && cellKey(head) === cellKey(cell)) {
      this.setState({ ...state, draftPath: path.slice(0, -1) });
      return;
    }
    if (canAppendCell(path, cell, this.maskKeys())) {
      this.setState({ ...state, draftPath: [...path, cell] });
    }
  }

  clearDraft(): void {
    this.setState({ ...this.getState(), draftPath: [] });
  }

  /** Commit the draft path as a new arrow using the selected direction/colour. */
  commitArrow(): void {
    const state = this.getState();
    if (state.draftPath.length === 0) return;
    this.arrowCounter += 1;
    const arrow = {
      id: `arrow-${this.arrowCounter}`,
      color: state.selectedColor,
      direction: state.selectedDirection,
      path: [...state.draftPath],
    };
    const model = { ...state.model, arrows: [...state.model.arrows, arrow] };
    this.setState({ ...state, model, draftPath: [], review: reviewEditorLevel(model) });
  }

  removeArrow(id: string): void {
    const model = {
      ...this.getState().model,
      arrows: this.getState().model.arrows.filter((arrow) => arrow.id !== id),
    };
    this.commitModel(model);
  }

  canCommitDraft(): boolean {
    return this.getState().draftPath.length > 0;
  }

  canPublish(): boolean {
    return this.getState().review.valid;
  }

  /** Live preview source: the exported JSON of the current model (renders as you paint). */
  previewSource(): unknown {
    return exportLevelDefinition(this.getState().model);
  }

  publish(): void {
    const { review } = this.getState();
    if (review.valid && review.value !== null) {
      this.onPublish(review.value);
    }
  }
}
