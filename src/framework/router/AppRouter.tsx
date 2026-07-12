import { useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider, useNavigate } from "react-router-dom";
import { LoginScreen } from "@/presentation/auth/LoginScreen";
import { LoginViewModel } from "@/presentation/auth/LoginViewModel";
import { useSession } from "@/framework/session/SessionContext";
import { AdminLayout } from "@/framework/layout/AdminLayout";
import { AdminLevelsRoute } from "@/framework/level/AdminLevelsRoute";
import { AdminLevelCreatorRoute } from "@/framework/level/AdminLevelCreatorRoute";
import { AdminLevelEditorRoute } from "@/framework/level/AdminLevelEditorRoute";
import { AdminLeaderboardRoute } from "@/framework/leaderboard/AdminLeaderboardRoute";
import { AdminUsersRoute } from "@/framework/user/AdminUsersRoute";
import { AdminDailyChallengeRoute } from "@/framework/daily-challenge/AdminDailyChallengeRoute";
import { RequireAdmin } from "./RequireAdmin";

/** Public login route. Builds the login ViewModel from the composed use case. */
function LoginRoute() {
  const { session, signIn, loginUseCase } = useSession();
  const navigate = useNavigate();
  const [viewModel] = useState(
    () =>
      new LoginViewModel(loginUseCase, (authenticated) => {
        signIn(authenticated);
        navigate("/", { replace: true });
      }),
  );
  if (session !== null) return <Navigate to="/" replace />;
  return <LoginScreen viewModel={viewModel} />;
}

/** Application router (composition root for routes). */
export function AppRouter() {
  const router = createBrowserRouter([
    { path: "/login", element: <LoginRoute /> },
    {
      path: "/",
      element: (
        <RequireAdmin>
          <AdminLayout />
        </RequireAdmin>
      ),
      children: [
        { index: true, element: <Navigate to="/levels" replace /> },
        { path: "levels", element: <AdminLevelsRoute /> },
        { path: "levels/new", element: <AdminLevelCreatorRoute /> },
        { path: "levels/new/visual", element: <AdminLevelEditorRoute /> },
        { path: "users", element: <AdminUsersRoute /> },
        { path: "leaderboard", element: <AdminLeaderboardRoute /> },
        { path: "daily-challenge", element: <AdminDailyChallengeRoute /> },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}
