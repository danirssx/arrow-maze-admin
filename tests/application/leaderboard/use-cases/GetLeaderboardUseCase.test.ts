import { describe, expect, it, vi } from "vitest";
import type { LeaderboardData } from "@/application/leaderboard/Leaderboard";
import type { ILeaderboardApi } from "@/application/ports/ILeaderboardApi";
import { GetLeaderboardUseCase } from "@/application/leaderboard/use-cases/GetLeaderboardUseCase";

const data: LeaderboardData = {
  levelId: "l1",
  entries: [
    { entryId: "e1", userId: "u1", usernameSnapshot: "mika", score: 900, timeSeconds: 12, movesCount: 8, rank: 1, submittedAt: "2026-07-01T10:00:00.000Z" },
  ],
};

describe("GetLeaderboardUseCase", () => {
  it("delegates the level id to the api and returns the leaderboard", async () => {
    const api: ILeaderboardApi = { get: vi.fn(async () => data) };

    const result = await new GetLeaderboardUseCase(api).execute("l1");

    expect(api.get).toHaveBeenCalledWith("l1");
    expect(result).toBe(data);
  });
});
