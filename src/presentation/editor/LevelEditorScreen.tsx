import {
  ARROW_COLORS,
  ARROW_DIRECTIONS,
  BOARD_FIGURES,
  FIGURE_GRID_SIZE,
  cellKey,
  figureById,
} from "@/application/editor/editorCatalog";
import { useViewModelState } from "@/presentation/hooks/useViewModelState";
import { BoardPreview } from "@/presentation/board/BoardPreview";
import type { LevelEditorViewModel } from "./LevelEditorViewModel";

interface LevelEditorScreenProps {
  viewModel: LevelEditorViewModel;
  serverError?: string | null;
  isSubmitting?: boolean;
}

const GRID_INDICES = Array.from({ length: FIGURE_GRID_SIZE }, (_, index) => index);

/**
 * MVVM view — visual level editor. Dumb: figure picker, click-to-paint grid, direction/colour
 * pickers, arrow list, inline validation errors (from the domain), a live board preview
 * (AD-04) and publish (via AD-06). It renders view state and raises intents; no rules here.
 */
export function LevelEditorScreen({
  viewModel,
  serverError = null,
  isSubmitting = false,
}: LevelEditorScreenProps) {
  const state = useViewModelState(viewModel);
  const { model, draftPath, selectedDirection, selectedColor, review } = state;

  const figure = model.figureId !== null ? figureById(model.figureId) : undefined;
  const maskKeys = new Set(figure !== undefined ? figure.cells.map(cellKey) : []);
  const draftKeys = new Set(draftPath.map(cellKey));
  const arrowColorByCell = new Map<string, string>();
  model.arrows.forEach((arrow) => arrow.path.forEach((cell) => arrowColorByCell.set(cellKey(cell), arrow.color)));

  return (
    <section className="mx-auto max-w-5xl p-6" data-testid="level-editor">
      <h1 className="text-2xl font-black text-text-primary">Visual level editor</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Pick a figure, paint arrows inside it, then publish. The backend validates on publish.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex flex-wrap gap-2">
            <input
              data-testid="name-input"
              value={model.name}
              onChange={(e) => viewModel.setName(e.target.value)}
              placeholder="Level name"
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-text-primary"
            />
            <select
              data-testid="difficulty-select"
              value={model.difficulty}
              onChange={(e) => viewModel.setDifficulty(e.target.value)}
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-text-primary"
            >
              {["EASY", "MEDIUM", "HARD"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-text-secondary">Board figure</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {BOARD_FIGURES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  data-testid={`figure-${f.id}`}
                  aria-pressed={model.figureId === f.id}
                  onClick={() => viewModel.selectFigure(f.id)}
                  className={`rounded-lg border px-3 py-1 text-xs font-bold ${
                    model.figureId === f.id
                      ? "border-primary-700 bg-primary-700 text-text-inverse"
                      : "border-border-soft text-text-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div>
              <span className="text-xs font-semibold text-text-secondary">Direction</span>
              <div className="mt-1 flex gap-1">
                {ARROW_DIRECTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    data-testid={`dir-${d}`}
                    aria-pressed={selectedDirection === d}
                    onClick={() => viewModel.setDirection(d)}
                    className={`rounded-lg border px-2 py-1 text-xs font-bold ${
                      selectedDirection === d ? "border-primary-700 text-primary-900" : "border-border-soft text-text-secondary"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary">Colour</span>
              <div className="mt-1 flex gap-1">
                {ARROW_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    data-testid={`color-${c}`}
                    aria-pressed={selectedColor === c}
                    onClick={() => viewModel.setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`h-6 w-6 rounded-full border-2 ${selectedColor === c ? "border-text-primary" : "border-transparent"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 inline-block rounded-xl border border-border-soft bg-background-card p-2" data-testid="editor-grid">
            {GRID_INDICES.map((r) => (
              <div key={r} className="flex">
                {GRID_INDICES.map((c) => {
                  const key = `${r},${c}`;
                  const inMask = maskKeys.has(key);
                  const inDraft = draftKeys.has(key);
                  const committed = arrowColorByCell.get(key);
                  const background = inDraft ? "#94A3B8" : (committed ?? (inMask ? "#EEF1FF" : "transparent"));
                  return (
                    <button
                      key={c}
                      type="button"
                      data-testid={`cell-${r}-${c}`}
                      disabled={!inMask}
                      onClick={() => viewModel.paintCell({ row: r, col: c })}
                      style={{ backgroundColor: background }}
                      className={`m-0.5 h-8 w-8 rounded ${inMask ? "border border-border-soft" : "opacity-20"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              data-testid="add-arrow"
              disabled={!viewModel.canCommitDraft()}
              onClick={() => viewModel.commitArrow()}
              className="rounded-lg bg-primary-700 px-3 py-1 text-xs font-bold text-text-inverse disabled:opacity-50"
            >
              Add arrow
            </button>
            <button
              type="button"
              data-testid="clear-draft"
              onClick={() => viewModel.clearDraft()}
              className="rounded-lg border border-border-soft px-3 py-1 text-xs font-bold text-text-secondary"
            >
              Clear draft
            </button>
          </div>

          {model.arrows.length > 0 ? (
            <ul className="mt-3 space-y-1" data-testid="arrow-list">
              {model.arrows.map((arrow) => (
                <li key={arrow.id} data-testid={`arrow-item-${arrow.id}`} className="flex items-center gap-2 text-xs text-text-secondary">
                  <span style={{ backgroundColor: arrow.color }} className="h-3 w-3 rounded-full" />
                  {arrow.id} · {arrow.direction} · {arrow.path.length} cells
                  <button
                    type="button"
                    data-testid={`remove-arrow-${arrow.id}`}
                    onClick={() => viewModel.removeArrow(arrow.id)}
                    className="rounded border border-border-soft px-2 py-0.5 font-bold"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <span className="text-xs font-semibold text-text-secondary">Preview</span>
          <div className="mt-1">
            <BoardPreview source={viewModel.previewSource()} />
          </div>

          {review.errors.length > 0 ? (
            <ul data-testid="editor-errors" className="mt-3 space-y-1">
              {review.errors.map((error, index) => (
                <li key={index} className="rounded-lg bg-reward-orange/10 px-3 py-2 text-xs font-semibold text-primary-900">
                  {error}
                </li>
              ))}
            </ul>
          ) : null}

          {serverError !== null ? (
            <p data-testid="server-error" className="mt-3 rounded-lg bg-primary-900/10 px-3 py-2 text-xs font-semibold text-primary-900">
              {serverError}
            </p>
          ) : null}

          <button
            type="button"
            data-testid="publish-level"
            disabled={!viewModel.canPublish() || isSubmitting}
            onClick={() => viewModel.publish()}
            className="mt-4 w-full rounded-2xl bg-primary-700 px-6 py-3 font-bold text-text-inverse disabled:opacity-50"
          >
            {isSubmitting ? "Creating & publishing…" : "Create & publish"}
          </button>
        </div>
      </div>
    </section>
  );
}
