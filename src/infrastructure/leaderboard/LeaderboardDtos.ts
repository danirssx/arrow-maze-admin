/** Backend wraps responses in `{ status:"success", data }` (ApiResponsePresenter). */
export interface ApiEnvelope<T> {
  status: "success";
  data: T;
}

export interface LeaderboardEntryDto {
  entryId: string;
  userId: string;
  usernameSnapshot: string;
  score: number;
  timeSeconds: number;
  movesCount: number;
  rank: number;
  submittedAt: string;
}

export interface LeaderboardDataDto {
  levelId: string;
  entries: LeaderboardEntryDto[];
  leaderboardId?: string;
  updatedAt?: string;
}
