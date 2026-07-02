import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "@/framework/providers/AppProviders";
import { AppRouter } from "@/framework/router/AppRouter";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);
