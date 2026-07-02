import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardScreen } from "@/presentation/screens/DashboardScreen";
import { loadEnv } from "@/framework/config/env";

/** Application router (composition root for routes). */
export function AppRouter() {
  const env = loadEnv();
  const router = createBrowserRouter([
    { path: "/", element: <DashboardScreen apiBaseUrl={env.apiBaseUrl} /> },
  ]);
  return <RouterProvider router={router} />;
}
