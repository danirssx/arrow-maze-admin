import type {
  DailyChallenge,
  DailyChallengeOperation,
} from "@/application/daily-challenge/DailyChallenge";
import { BoardPreview } from "@/presentation/board/BoardPreview";

interface DailyChallengeViewProps {
  challenge: DailyChallenge | null;
  operation: DailyChallengeOperation | null;
  isLoading: boolean;
  isIterating: boolean;
  errorMessage: string | null;
  iterationErrorMessage: string | null;
  onIterate: () => void;
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-background-card px-3 py-2">
      <dt className="text-xs font-semibold text-text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-text-primary">{value}</dd>
    </div>
  );
}

/**
 * MVVM view — dumb Daily Challenge dashboard. It renders the state supplied by the
 * framework ViewModel and dispatches iteration through a callback.
 */
export function DailyChallengeView({
  challenge,
  operation,
  isLoading,
  isIterating,
  errorMessage,
  iterationErrorMessage,
  onIterate,
}: DailyChallengeViewProps) {
  const events = [...(operation?.events ?? [])].sort((a, b) => a.sequence - b.sequence);

  return (
    <section data-testid="daily-challenge-view">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Daily Challenge</h1>
          <p className="mt-1 text-sm text-text-secondary">Current UTC daily puzzle</p>
        </div>
        <button
          type="button"
          disabled={isIterating}
          onClick={onIterate}
          className="rounded-xl bg-primary-700 px-4 py-2 text-sm font-bold text-text-inverse disabled:cursor-not-allowed disabled:opacity-60"
        >
          Iterate daily challenge
        </button>
      </div>

      {isLoading ? (
        <p data-testid="daily-loading" className="mt-4 text-sm text-text-secondary">
          Loading daily challenge…
        </p>
      ) : null}

      {errorMessage !== null ? (
        <p data-testid="daily-load-error" className="mt-4 rounded-xl bg-reward-orange/10 px-4 py-3 text-sm font-semibold text-primary-900">
          {errorMessage}
        </p>
      ) : null}

      {iterationErrorMessage !== null ? (
        <p data-testid="daily-iteration-error" className="mt-4 rounded-xl bg-reward-orange/10 px-4 py-3 text-sm font-semibold text-primary-900">
          {iterationErrorMessage}
        </p>
      ) : null}

      {challenge !== null ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(280px,440px)_1fr]">
          <div>
            <BoardPreview source={challenge.level.definition} />
            <h2 className="mt-4 text-lg font-black text-text-primary">{challenge.level.name}</h2>
            <p className="mt-1 text-sm text-text-secondary">{challenge.level.description}</p>
          </div>

          <div className="space-y-6">
            <dl className="grid gap-3 md:grid-cols-2">
              <MetadataItem label="Date" value={challenge.date} />
              <MetadataItem label="Seed" value={challenge.seed} />
              <MetadataItem label="Target difficulty" value={challenge.targetDifficulty} />
              <MetadataItem label="Level difficulty" value={challenge.level.difficulty} />
              <MetadataItem label="Source" value={challenge.source} />
              <MetadataItem label="Generated UTC" value={challenge.generatedAt} />
              <MetadataItem label="Expires UTC" value={challenge.expiresAt} />
              <MetadataItem label="Validation" value={`solvable: ${String(challenge.validation.solvable)}`} />
              <MetadataItem
                label="Difficulty matched"
                value={`difficultyMatched: ${String(challenge.validation.difficultyMatched)}`}
              />
              <MetadataItem
                label="Fallback"
                value={`fallbackUsed: ${String(challenge.validation.fallbackUsed)}`}
              />
            </dl>

            <section
              data-testid="daily-activity-unavailable"
              className="rounded-xl border border-dashed border-border-soft bg-background-soft px-4 py-3 text-sm text-text-secondary"
            >
              Daily gameplay activity is not available yet from the backend.
            </section>
          </div>
        </div>
      ) : null}

      <section className="mt-6 rounded-xl border border-border-soft bg-background-card p-4">
        <h2 className="text-lg font-black text-text-primary">Iteration log</h2>
        {operation !== null ? (
          <p data-testid="daily-operation-status" className="mt-1 text-sm font-semibold text-text-secondary">
            {operation.status}
          </p>
        ) : (
          <p className="mt-1 text-sm text-text-secondary">No iteration requested in this session.</p>
        )}
        {events.length > 0 ? (
          <ol className="mt-3 space-y-2">
            {events.map((event) => (
              <li
                key={`${event.sequence}-${event.type}`}
                data-testid="daily-operation-event"
                className="rounded-lg border border-border-soft px-3 py-2 text-sm text-text-secondary"
              >
                <span className="font-bold text-text-primary">{event.sequence}. {event.type}</span>
                <span className="ml-2">{event.message}</span>
                <span className="ml-2 text-text-muted">{event.createdAt}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </section>
  );
}
