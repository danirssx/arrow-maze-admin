import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { AdminLevelRow } from "@/application/level/AdminLevelRow";
import { toStatusQuery, type LevelStatusFilter } from "@/application/level/LevelStatusFilter";
import { useAdminLevelServices } from "./adminLevelServices";

const LEVELS_QUERY_KEY = "admin-levels";

/** The view state + intents the levels screen renders (a hook-based MVVM view-model). */
export interface AdminLevelsViewModel {
  rows: AdminLevelRow[];
  statusFilter: LevelStatusFilter;
  onStatusFilterChange: (filter: LevelStatusFilter) => void;
  onView: (levelId: string) => void;
  onPublish: (levelId: string) => void;
  onArchive: (levelId: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  pendingLevelId: string | null;
  expandedLevelId: string | null;
}

function toErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  return null;
}

/**
 * React Query view-model for the admin levels screen: fetches the (status-filtered) list,
 * exposes publish/archive mutations that refresh the list on success, and owns the local
 * filter / expanded-row / pending-action view state. Server errors surface via
 * `errorMessage` (the HTTP client already lifts the backend `error.message`).
 */
export function useAdminLevels(): AdminLevelsViewModel {
  const { listUseCase, publishUseCase, archiveUseCase } = useAdminLevelServices();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<LevelStatusFilter>("ALL");
  const [expandedLevelId, setExpandedLevelId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [LEVELS_QUERY_KEY, statusFilter],
    queryFn: () => listUseCase.execute(toStatusQuery(statusFilter)),
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [LEVELS_QUERY_KEY] }),
    [queryClient],
  );

  const publishMutation = useMutation({
    mutationFn: (levelId: string) => publishUseCase.execute(levelId),
    onSuccess: invalidate,
  });
  const archiveMutation = useMutation({
    mutationFn: (levelId: string) => archiveUseCase.execute(levelId),
    onSuccess: invalidate,
  });

  const onView = useCallback(
    (levelId: string) => setExpandedLevelId((current) => (current === levelId ? null : levelId)),
    [],
  );

  const pendingLevelId = publishMutation.isPending
    ? (publishMutation.variables ?? null)
    : archiveMutation.isPending
      ? (archiveMutation.variables ?? null)
      : null;

  const errorMessage =
    toErrorMessage(query.error) ??
    toErrorMessage(publishMutation.error) ??
    toErrorMessage(archiveMutation.error);

  return {
    rows: query.data ?? [],
    statusFilter,
    onStatusFilterChange: setStatusFilter,
    onView,
    onPublish: publishMutation.mutate,
    onArchive: archiveMutation.mutate,
    isLoading: query.isLoading,
    errorMessage,
    pendingLevelId,
    expandedLevelId,
  };
}
