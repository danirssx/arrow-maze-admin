import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LevelEditorScreen } from "@/presentation/editor/LevelEditorScreen";
import { LevelEditorViewModel } from "@/presentation/editor/LevelEditorViewModel";
import { useAdminLevelServices } from "./adminLevelServices";

function toErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  return null;
}

/**
 * Protected `/levels/new/visual` route: wires the AD-10 visual editor to the same AD-06
 * create→publish flow. The editor exports the Phase-1 JSON, which is created + published; on
 * success the levels list is refreshed and we return to it. Backend errors surface inline.
 */
export function AdminLevelEditorRoute() {
  const { createAndPublishUseCase } = useAdminLevelServices();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (level: unknown) => createAndPublishUseCase.execute(level),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
      navigate("/levels");
    },
  });

  const [viewModel] = useState(() => new LevelEditorViewModel((level) => mutation.mutate(level)));

  return (
    <LevelEditorScreen
      viewModel={viewModel}
      serverError={toErrorMessage(mutation.error)}
      isSubmitting={mutation.isPending}
    />
  );
}
