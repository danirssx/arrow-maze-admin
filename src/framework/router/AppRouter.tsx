import { useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider, useNavigate } from "react-router-dom";
import { LoginScreen } from "@/presentation/auth/LoginScreen";
import { LoginViewModel } from "@/presentation/auth/LoginViewModel";
import { SectionPlaceholderScreen } from "@/presentation/screens/SectionPlaceholderScreen";
import { useSession } from "@/framework/session/SessionContext";
import { AdminLayout } from "@/framework/layout/AdminLayout";
import { AdminLevelsRoute } from "@/framework/level/AdminLevelsRoute";
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
        { path: "leaderboard", element: <SectionPlaceholderScreen title="Leaderboard" /> },
        { path: "users", element: <SectionPlaceholderScreen title="Users" /> },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}
