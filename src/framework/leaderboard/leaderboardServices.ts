import { useMemo } from "react";
import { GetLeaderboardUseCase } from "@/application/leaderboard/use-cases/GetLeaderboardUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { HttpLeaderboardApi } from "@/infrastructure/leaderboard/HttpLeaderboardApi";
import { useSession } from "@/framework/session/SessionContext";

export interface LeaderboardServices {
  getLeaderboardUseCase: GetLeaderboardUseCase;
}

/** Composition root for the leaderboard vertical, over one authenticated HTTP client. */
export function createLeaderboardServices(httpClient: IHttpClient): LeaderboardServices {
  return { getLeaderboardUseCase: new GetLeaderboardUseCase(new HttpLeaderboardApi(httpClient)) };
}

/** Memoized services bound to the session's authenticated HTTP client. */
export function useLeaderboardServices(): LeaderboardServices {
  const { httpClient } = useSession();
  return useMemo(() => createLeaderboardServices(httpClient), [httpClient]);
}
