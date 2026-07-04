import type { LeaderboardEntry } from "@/application/leaderboard/Leaderboard";
import { formatCreatedAt } from "@/presentation/level/formatCreatedAt";

export interface LeaderboardLevelOption {
  levelId: string;
  name: string;
  status: string;
}

interface LeaderboardViewProps {
  levels: LeaderboardLevelOption[];
  selectedLevelId: string | null;
  onSelectLevel: (levelId: string) => void;
  entries: LeaderboardEntry[];
  isLevelsLoading: boolean;
  isLoading: boolean;
  errorMessage: string | null;
}

/**
 * MVVM view — read-only leaderboard viewer. Dumb: a level selector (incl. ARCHIVED levels) and a
 * read-only entries table. No score submit/edit/delete action is ever offered; when no level is
 * selected it prompts instead of fetching.
 */
export function LeaderboardView({
  levels,
  selectedLevelId,
  onSelectLevel,
  entries,
  isLevelsLoading,
  isLoading,
  errorMessage,
}: LeaderboardViewProps) {
  return (
    <section data-testid="leaderboard-view">
      <h1 className="text-2xl font-black text-text-primary">Leaderboard</h1>

      <label className="mt-4 block text-xs font-semibold text-text-secondary" htmlFor="lb-level">
        Level
      </label>
      <select
        id="lb-level"
        data-testid="leaderboard-level-select"
        value={selectedLevelId ?? ""}
        disabled={isLevelsLoading}
        onChange={(e) => onSelectLevel(e.target.value)}
        className="mt-1 w-full max-w-md rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-text-primary"
      >
        <option value="" disabled>
          {isLevelsLoading ? "Loading levels…" : "Select a level…"}
        </option>
        {levels.map((level) => (
          <option key={level.levelId} value={level.levelId}>
            {level.name} ({level.status})
          </option>
        ))}
      </select>

      {errorMessage !== null ? (
        <p data-testid="leaderboard-error" className="mt-4 rounded-xl bg-reward-orange/10 px-4 py-3 text-sm font-semibold text-primary-900">
          {errorMessage}
        </p>
      ) : null}

      {selectedLevelId === null ? (
        <p data-testid="leaderboard-neutral" className="mt-4 text-sm text-text-secondary">
          Choose a level to see its leaderboard.
        </p>
      ) : isLoading ? (
        <p data-testid="leaderboard-loading" className="mt-4 text-sm text-text-secondary">
          Loading leaderboard…
        </p>
      ) : entries.length === 0 ? (
        <p data-testid="leaderboard-empty" className="mt-4 text-sm text-text-secondary">
          No scores yet for this level.
        </p>
      ) : (
        <table className="mt-4 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border-soft text-text-muted">
              <th className="py-2 pr-3 font-semibold">Rank</th>
              <th className="py-2 pr-3 font-semibold">Player</th>
              <th className="py-2 pr-3 font-semibold">Score</th>
              <th className="py-2 pr-3 font-semibold">Time</th>
              <th className="py-2 pr-3 font-semibold">Moves</th>
              <th className="py-2 font-semibold">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.entryId} data-testid={`entry-row-${entry.entryId}`} className="border-b border-border-soft">
                <td className="py-2 pr-3 font-semibold text-text-primary">{entry.rank}</td>
                <td className="py-2 pr-3 text-text-secondary">{entry.usernameSnapshot}</td>
                <td className="py-2 pr-3 text-text-secondary">{entry.score}</td>
                <td className="py-2 pr-3 text-text-secondary">{entry.timeSeconds}s</td>
                <td className="py-2 pr-3 text-text-secondary">{entry.movesCount}</td>
                <td className="py-2 text-text-secondary">{formatCreatedAt(entry.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
