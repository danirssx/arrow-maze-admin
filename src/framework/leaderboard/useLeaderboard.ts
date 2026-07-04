import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { LeaderboardEntry } from "@/application/leaderboard/Leaderboard";
import { useAdminLevelServices } from "@/framework/level/adminLevelServices";
import type { LeaderboardLevelOption } from "@/presentation/leaderboard/LeaderboardView";
import { useLeaderboardServices } from "./leaderboardServices";

/** View state + intents the leaderboard screen renders (a hook-based MVVM view-model). */
export interface LeaderboardViewModel {
  levels: LeaderboardLevelOption[];
  selectedLevelId: string | null;
  onSelectLevel: (levelId: string) => void;
  entries: LeaderboardEntry[];
  isLevelsLoading: boolean;
  isLoading: boolean;
  errorMessage: string | null;
}

function toErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  return null;
}

/**
 * React Query view-model for the leaderboard screen: loads the level selector (all statuses,
 * incl. ARCHIVED) via the admin levels use case, and fetches `GET /leaderboard/:levelId` only
 * once a level is selected. Read-only.
 */
export function useLeaderboard(): LeaderboardViewModel {
  const { listUseCase } = useAdminLevelServices();
  const { getLeaderboardUseCase } = useLeaderboardServices();
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  const levelsQuery = useQuery({
    queryKey: ["leaderboard-levels"],
    queryFn: () => listUseCase.execute(),
  });

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", selectedLevelId],
    queryFn: () => getLeaderboardUseCase.execute(selectedLevelId as string),
    enabled: selectedLevelId !== null,
  });

  const levels: LeaderboardLevelOption[] = (levelsQuery.data ?? []).map((row) => ({
    levelId: row.levelId,
    name: row.name,
    status: row.status,
  }));

  return {
    levels,
    selectedLevelId,
    onSelectLevel: setSelectedLevelId,
    entries: leaderboardQuery.data?.entries ?? [],
    isLevelsLoading: levelsQuery.isLoading,
    isLoading: selectedLevelId !== null && leaderboardQuery.isLoading,
    errorMessage: toErrorMessage(leaderboardQuery.error) ?? toErrorMessage(levelsQuery.error),
  };
}
