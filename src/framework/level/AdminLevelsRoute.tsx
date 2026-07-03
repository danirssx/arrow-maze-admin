import { useNavigate } from "react-router-dom";
import { LevelsView } from "@/presentation/level/LevelsView";
import { useAdminLevels } from "./useAdminLevels";

/** Protected `/levels` route: binds the React Query view-model to the dumb levels table. */
export function AdminLevelsRoute() {
  const viewModel = useAdminLevels();
  const navigate = useNavigate();
  return <LevelsView {...viewModel} onCreate={() => navigate("/levels/new")} />;
}
