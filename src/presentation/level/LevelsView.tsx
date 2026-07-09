import { Fragment } from "react";
import type { AdminLevelRow } from "@/application/level/AdminLevelRow";
import {
  LEVEL_STATUS_FILTER_OPTIONS,
  type LevelStatusFilter,
} from "@/application/level/LevelStatusFilter";
import { formatCreatedAt } from "./formatCreatedAt";

interface LevelsViewProps {
  rows: AdminLevelRow[];
  statusFilter: LevelStatusFilter;
  onStatusFilterChange: (filter: LevelStatusFilter) => void;
  onView: (levelId: string) => void;
  onPublish: (levelId: string) => void;
  onArchive: (levelId: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  pendingLevelId: string | null;
  expandedLevelId: string | null;
  /** Optional "New level" action (wired by the route to navigate to the creator). */
  onCreate?: () => void;
  /** Optional "Visual editor" action (navigates to the AD-10 editor). */
  onCreateVisual?: () => void;
}

/**
 * MVVM view — the admin levels table. Dumb: it renders the rows + view state it is given
 * and raises intents; it holds no data-fetching, navigation, or lifecycle rules. Which
 * actions a row offers comes from the `canPublish` / `canArchive` flags computed upstream.
 */
export function LevelsView({
  rows,
  statusFilter,
  onStatusFilterChange,
  onView,
  onPublish,
  onArchive,
  isLoading,
  errorMessage,
  pendingLevelId,
  expandedLevelId,
  onCreate,
  onCreateVisual,
}: LevelsViewProps) {
  return (
    <section data-testid="levels-view">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-text-primary">Levels</h1>
        <div className="flex items-center gap-3">
          {onCreateVisual !== undefined ? (
            <button
              type="button"
              data-testid="new-level-visual"
              onClick={onCreateVisual}
              className="rounded-xl border border-border-soft px-4 py-2 text-sm font-bold text-text-secondary active:opacity-80"
            >
              Visual editor
            </button>
          ) : null}
          {onCreate !== undefined ? (
            <button
              type="button"
              data-testid="new-level"
              onClick={onCreate}
              className="rounded-xl bg-primary-700 px-4 py-2 text-sm font-bold text-text-inverse active:opacity-80"
            >
              New level
            </button>
          ) : null}
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Status
            <select
              data-testid="status-filter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as LevelStatusFilter)}
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-text-primary"
            >
              {LEVEL_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p data-testid="archive-note" className="mb-4 text-xs text-text-muted">
        Archiving removes a level from the game catalog but keeps its leaderboard and score history —
        it is not a deletion. Create a replacement with <span className="font-semibold">New level</span>.
      </p>

      {errorMessage !== null ? (
        <p data-testid="levels-error" className="mb-4 rounded-xl bg-reward-orange/10 px-4 py-3 text-sm font-semibold text-primary-900">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <p data-testid="levels-loading" className="text-sm text-text-secondary">
          Loading levels…
        </p>
      ) : rows.length === 0 ? (
        <p data-testid="levels-empty" className="text-sm text-text-secondary">
          No levels found.
        </p>
      ) : (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border-soft text-text-muted">
              <th className="py-2 pr-3 font-semibold">Name</th>
              <th className="py-2 pr-3 font-semibold">Difficulty</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="py-2 pr-3 font-semibold">Arrows</th>
              <th className="py-2 pr-3 font-semibold">Created</th>
              <th className="py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pending = pendingLevelId === row.levelId;
              const expanded = expandedLevelId === row.levelId;
              return (
                <Fragment key={row.levelId}>
                  <tr data-testid={`level-row-${row.levelId}`} className="border-b border-border-soft">
                    <td className="py-2 pr-3 font-semibold text-text-primary">{row.name}</td>
                    <td className="py-2 pr-3 text-text-secondary">{row.difficulty}</td>
                    <td className="py-2 pr-3">
                      <span data-testid={`level-status-${row.levelId}`} className="rounded-lg bg-background-soft px-2 py-1 text-xs font-bold text-text-secondary">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-text-secondary">{row.arrowCount}</td>
                    <td className="py-2 pr-3 text-text-secondary">{formatCreatedAt(row.createdAt)}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          data-testid={`view-${row.levelId}`}
                          onClick={() => onView(row.levelId)}
                          className="rounded-lg border border-border-soft px-3 py-1 text-xs font-bold text-text-secondary"
                        >
                          {expanded ? "Hide" : "View"}
                        </button>
                        {row.canPublish ? (
                          <button
                            type="button"
                            data-testid={`publish-${row.levelId}`}
                            disabled={pending}
                            onClick={() => onPublish(row.levelId)}
                            className="rounded-lg bg-primary-700 px-3 py-1 text-xs font-bold text-text-inverse disabled:opacity-50"
                          >
                            Publish
                          </button>
                        ) : null}
                        {row.canArchive ? (
                          <button
                            type="button"
                            data-testid={`archive-${row.levelId}`}
                            disabled={pending}
                            onClick={() => onArchive(row.levelId)}
                            title="Removes this level from the game catalog but keeps its score history — not a deletion."
                            className="rounded-lg border border-border-soft px-3 py-1 text-xs font-bold text-text-secondary disabled:opacity-50"
                          >
                            Archive
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr key={`${row.levelId}-detail`} data-testid={`level-detail-${row.levelId}`} className="border-b border-border-soft bg-background-soft">
                      <td colSpan={6} className="py-2 pr-3 text-xs text-text-secondary">
                        id: {row.levelId} · attempts: {row.attempts} · arrows: {row.arrowCount} ·
                        time limit: {row.timeLimitSeconds ?? "—"}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
