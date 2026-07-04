import { LeaderboardView } from "@/presentation/leaderboard/LeaderboardView";
import { useLeaderboard } from "./useLeaderboard";

/** Protected `/leaderboard` route: binds the read-only leaderboard view-model to the view. */
export function AdminLeaderboardRoute() {
  const viewModel = useLeaderboard();
  return <LeaderboardView {...viewModel} />;
}
