import type { LeaderboardData } from "@/application/leaderboard/Leaderboard";
import type { ILeaderboardApi } from "@/application/ports/ILeaderboardApi";

/** Reads the leaderboard for a level (read-only; archived levels keep readable history). */
export class GetLeaderboardUseCase {
  constructor(private readonly api: ILeaderboardApi) {}

  async execute(levelId: string): Promise<LeaderboardData> {
    return this.api.get(levelId);
  }
}
