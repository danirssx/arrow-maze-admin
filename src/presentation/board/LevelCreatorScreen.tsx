import type { ChangeEvent } from "react";
import { useViewModelState } from "@/presentation/hooks/useViewModelState";
import { BoardPreview } from "@/presentation/board/BoardPreview";
import type { LevelCreatorViewModel } from "./LevelCreatorViewModel";
import { LEVEL_JSON_SCHEMA_EXAMPLE } from "./levelJsonSchemaExample";

/**
 * MVVM view — level creator. Dumb: paste/upload JSON, shows the expected schema, inline
 * shape errors, and a live board preview (AD-04). Submit is enabled only when the review is
 * valid; the actual server create/publish is wired in AD-06.
 */
export function LevelCreatorScreen({ viewModel }: { viewModel: LevelCreatorViewModel }) {
  const state = useViewModelState(viewModel);
  const { status, errors } = state.review;
  const canSubmit = status === "valid";

  const onTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    viewModel.setJsonText(event.target.value);
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file === undefined) return;
    viewModel.setJsonText(await file.text());
  };

  return (
    <section className="mx-auto max-w-4xl p-6" data-testid="level-creator">
      <h1 className="text-2xl font-black text-text-primary">New level</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Paste or upload the level JSON. Fix any shape errors before submitting.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-text-secondary" htmlFor="level-json">
            Level JSON
          </label>
          <textarea
            id="level-json"
            data-testid="json-input"
            value={state.jsonText}
            onChange={onTextChange}
            rows={16}
            spellCheck={false}
            className="mt-1 w-full rounded-xl border border-border-soft bg-white p-3 font-mono text-xs text-text-primary outline-none focus:border-primary-500"
            placeholder="Paste level JSON here…"
          />
          <input
            type="file"
            accept="application/json,.json"
            data-testid="json-file"
            onChange={onFileChange}
            className="mt-2 block text-xs text-text-secondary"
          />

          {status === "syntax-error" || status === "invalid" ? (
            <ul data-testid="validation-errors" className="mt-3 space-y-1">
              {errors.map((error, index) => (
                <li
                  key={index}
                  className="rounded-lg bg-reward-orange/10 px-3 py-2 text-xs font-semibold text-primary-900"
                >
                  {error}
                </li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            data-testid="submit-level"
            disabled={!canSubmit}
            onClick={() => viewModel.submit()}
            className="mt-4 w-full rounded-2xl bg-primary-700 px-6 py-3 font-bold text-text-inverse disabled:opacity-50"
          >
            Continue
          </button>
        </div>

        <div>
          <span className="text-xs font-semibold text-text-secondary">Preview</span>
          <div className="mt-1">
            {canSubmit ? (
              <BoardPreview source={state.review.value} />
            ) : (
              <div
                data-testid="preview-placeholder"
                className="rounded-xl border border-border-soft bg-background-soft px-4 py-6 text-center text-sm text-text-secondary"
              >
                A valid level renders here.
              </div>
            )}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-semibold text-text-secondary">
              Expected JSON schema
            </summary>
            <pre
              data-testid="schema-example"
              className="mt-2 overflow-x-auto rounded-xl bg-background-card p-3 font-mono text-[11px] text-text-secondary"
            >
              {LEVEL_JSON_SCHEMA_EXAMPLE}
            </pre>
          </details>
        </div>
      </div>
    </section>
  );
}
