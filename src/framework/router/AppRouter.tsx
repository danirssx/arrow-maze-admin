import { useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider, useNavigate } from "react-router-dom";
import { LoginScreen } from "@/presentation/auth/LoginScreen";
import { LoginViewModel } from "@/presentation/auth/LoginViewModel";
import { DashboardScreen } from "@/presentation/screens/DashboardScreen";
import { loadEnv } from "@/framework/config/env";
import { useSession } from "@/framework/session/SessionContext";
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

/** Protected dashboard route (wired to the session for username + sign-out). */
function DashboardRoute() {
  const { session, signOut } = useSession();
  const env = loadEnv();
  return (
    <DashboardScreen
      apiBaseUrl={env.apiBaseUrl}
      username={session?.username ?? ""}
      onLogout={() => void signOut()}
    />
  );
}

/** Application router (composition root for routes). */
export function AppRouter() {
  const router = createBrowserRouter([
    { path: "/login", element: <LoginRoute /> },
    {
      path: "/",
      element: (
        <RequireAdmin>
          <DashboardRoute />
        </RequireAdmin>
      ),
    },
  ]);
  return <RouterProvider router={router} />;
}
