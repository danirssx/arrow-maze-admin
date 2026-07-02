interface DashboardScreenProps {
  apiBaseUrl: string;
}

/**
 * MVVM view — placeholder dashboard shell. Dumb: it renders the props it is given and
 * holds no business rules. Real sections (levels, leaderboard, users) arrive in later
 * AD-* tickets.
 */
export function DashboardScreen({ apiBaseUrl }: DashboardScreenProps) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-black text-slate-900">Arrow Maze Admin</h1>
      <p className="mt-2 text-sm text-slate-500">Clean Architecture scaffold (AD-00 / MAZ-201).</p>
      <p className="mt-6 text-xs text-slate-400" data-testid="api-base-url">
        API: {apiBaseUrl}
      </p>
    </main>
  );
}
