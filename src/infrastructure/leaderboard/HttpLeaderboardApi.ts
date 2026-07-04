// Pattern: Adapter
import type { LeaderboardData, LeaderboardEntry } from "@/application/leaderboard/Leaderboard";
import type { ILeaderboardApi } from "@/application/ports/ILeaderboardApi";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import type { ApiEnvelope, LeaderboardDataDto, LeaderboardEntryDto } from "./LeaderboardDtos";

/** Adapts the public `GET /leaderboard/:levelId` read endpoint to the `ILeaderboardApi` port. */
export class HttpLeaderboardApi implements ILeaderboardApi {
  constructor(private readonly http: IHttpClient) {}

  async get(levelId: string): Promise<LeaderboardData> {
    const res = await this.http.get<ApiEnvelope<LeaderboardDataDto>>(
      `/leaderboard/${encodeURIComponent(levelId)}`,
    );
    const data = res.data.data;
    return {
      levelId: data.levelId,
      entries: data.entries.map(HttpLeaderboardApi.toEntry),
    };
  }

  private static toEntry(dto: LeaderboardEntryDto): LeaderboardEntry {
    return {
      entryId: dto.entryId,
      userId: dto.userId,
      usernameSnapshot: dto.usernameSnapshot,
      score: dto.score,
      timeSeconds: dto.timeSeconds,
      movesCount: dto.movesCount,
      rank: dto.rank,
      submittedAt: dto.submittedAt,
    };
  }
}
