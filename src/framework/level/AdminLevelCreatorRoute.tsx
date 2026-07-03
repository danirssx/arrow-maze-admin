import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LevelCreatorScreen } from "@/presentation/board/LevelCreatorScreen";
import { LevelCreatorViewModel } from "@/presentation/board/LevelCreatorViewModel";
import { useAdminLevelServices } from "./adminLevelServices";

function toErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  return null;
}

/**
 * Protected `/levels/new` route: wires the AD-05 creator to the backend create→publish flow.
 * On submit it creates a DRAFT and publishes it (the server validates ArrowSpec/containment
 * then DAG solvability); on success the levels list is refreshed and we return to it, so the
 * new level appears in the game. Backend rejections surface as `serverError`.
 */
export function AdminLevelCreatorRoute() {
  const { createAndPublishUseCase } = useAdminLevelServices();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (level: unknown) => createAndPublishUseCase.execute(level),
    onSuccess: async () => {
      // Matches the query key in useAdminLevels so the list refetches with the new level.
      await queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
      navigate("/levels");
    },
  });

  const [viewModel] = useState(
    () => new LevelCreatorViewModel((level) => mutation.mutate(level)),
  );

  return (
    <LevelCreatorScreen
      viewModel={viewModel}
      serverError={toErrorMessage(mutation.error)}
      isSubmitting={mutation.isPending}
    />
  );
}
