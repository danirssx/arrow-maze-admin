interface DashboardScreenProps {
  apiBaseUrl: string;
  username?: string;
  onLogout?: () => void;
}

/**
 * MVVM view — placeholder dashboard shell. Dumb: it renders the props it is given and
 * holds no business rules. Real sections (levels, leaderboard, users) arrive in later
 * AD-* tickets.
 */
export function DashboardScreen({ apiBaseUrl, username, onLogout }: DashboardScreenProps) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-text-primary">Arrow Maze Admin</h1>
        {onLogout !== undefined ? (
          <button
            type="button"
            data-testid="logout-button"
            onClick={onLogout}
            className="rounded-xl border border-border-soft px-4 py-2 text-sm font-bold text-text-secondary active:opacity-80"
          >
            Sign out
          </button>
        ) : null}
      </div>
      {username !== undefined && username !== "" ? (
        <p className="mt-2 text-sm text-text-secondary" data-testid="dashboard-username">
          Signed in as {username}
        </p>
      ) : null}
      <p className="mt-6 text-xs text-text-muted" data-testid="api-base-url">
        API: {apiBaseUrl}
      </p>
    </main>
  );
}
