import type { LeaderboardData } from "@/application/leaderboard/Leaderboard";

/** Application port for the read-only leaderboard endpoint. Adapter lives in infrastructure. */
export interface ILeaderboardApi {
  get(levelId: string): Promise<LeaderboardData>;
}
