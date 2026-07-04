import { describe, expect, it, vi } from "vitest";
import type { HttpResponse, IHttpClient } from "@/application/ports/IHttpClient";
import { HttpLeaderboardApi } from "@/infrastructure/leaderboard/HttpLeaderboardApi";

function makeHttp(response: HttpResponse): { http: IHttpClient; get: ReturnType<typeof vi.fn> } {
  const get = vi.fn(async () => response);
  const http = { get, post: vi.fn(), put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient;
  return { http, get };
}

const response: HttpResponse = {
  status: 200,
  data: {
    status: "success",
    data: {
      levelId: "l1",
      leaderboardId: "lb1",
      updatedAt: "2026-07-01T10:00:00.000Z",
      entries: [
        {
          entryId: "e1",
          userId: "u1",
          usernameSnapshot: "mika",
          score: 900,
          timeSeconds: 12,
          movesCount: 8,
          rank: 1,
          submittedAt: "2026-07-01T10:00:00.000Z",
        },
      ],
    },
  },
};

describe("HttpLeaderboardApi", () => {
  it("reads GET /leaderboard/:levelId (encoded) and maps the entries", async () => {
    const { http, get } = makeHttp(response);

    const result = await new HttpLeaderboardApi(http).get("a b/c");

    expect(get).toHaveBeenCalledWith("/leaderboard/a%20b%2Fc");
    expect(result.levelId).toBe("l1");
    expect(result.entries[0]).toEqual({
      entryId: "e1",
      userId: "u1",
      usernameSnapshot: "mika",
      score: 900,
      timeSeconds: 12,
      movesCount: 8,
      rank: 1,
      submittedAt: "2026-07-01T10:00:00.000Z",
    });
  });

  it("maps a known level with no scores to empty entries", async () => {
    const { http } = makeHttp({
      status: 200,
      data: { status: "success", data: { levelId: "l2", entries: [] } },
    });

    const result = await new HttpLeaderboardApi(http).get("l2");

    expect(result.entries).toEqual([]);
  });
});
