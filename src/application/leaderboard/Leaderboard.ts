export interface LeaderboardEntry {
  entryId: string;
  userId: string;
  usernameSnapshot: string;
  score: number;
  timeSeconds: number;
  movesCount: number;
  rank: number;
  submittedAt: string;
}

/** Read-only leaderboard for one level. `entries` is empty for a known level with no scores. */
export interface LeaderboardData {
  levelId: string;
  entries: LeaderboardEntry[];
}
