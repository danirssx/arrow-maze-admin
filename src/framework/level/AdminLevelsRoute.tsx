import { LevelsView } from "@/presentation/level/LevelsView";
import { useAdminLevels } from "./useAdminLevels";

/** Protected `/levels` route: binds the React Query view-model to the dumb levels table. */
export function AdminLevelsRoute() {
  const viewModel = useAdminLevels();
  return <LevelsView {...viewModel} />;
}
