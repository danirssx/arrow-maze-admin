import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/presentation/layout/AppShell";
import { AppShellViewModel } from "@/presentation/layout/AppShellViewModel";
import { ADMIN_SECTIONS } from "@/presentation/navigation/adminSections";

function renderShell(overrides?: {
  activeSectionId?: string | null;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
}) {
  const onNavigate = overrides?.onNavigate ?? vi.fn();
  const onLogout = overrides?.onLogout ?? vi.fn();
  const viewModel = new AppShellViewModel();
  render(
    <AppShell
      brandName="Arrow Maze Admin"
      username="admin"
      sections={ADMIN_SECTIONS}
      activeSectionId={overrides?.activeSectionId ?? "levels"}
      onNavigate={onNavigate}
      onLogout={onLogout}
      viewModel={viewModel}
    >
      <div>routed content</div>
    </AppShell>,
  );
  return { onNavigate, onLogout, viewModel };
}

describe("AppShell", () => {
  it("shows the brand, username and the three sections", () => {
    renderShell();
    expect(screen.getByTestId("brand")).toHaveTextContent("Arrow Maze Admin");
    expect(screen.getByTestId("admin-username")).toHaveTextContent("admin");
    expect(screen.getByTestId("nav-levels")).toHaveTextContent("Levels");
    expect(screen.getByTestId("nav-leaderboard")).toHaveTextContent("Leaderboard");
    expect(screen.getByTestId("nav-users")).toHaveTextContent("Users");
    expect(screen.getByTestId("admin-content")).toHaveTextContent("routed content");
  });

  it("marks the active section with aria-current", () => {
    renderShell({ activeSectionId: "leaderboard" });
    expect(screen.getByTestId("nav-leaderboard")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("nav-levels")).not.toHaveAttribute("aria-current");
  });

  it("navigates when a section is selected", async () => {
    const { onNavigate } = renderShell();
    await userEvent.click(screen.getByTestId("nav-users"));
    expect(onNavigate).toHaveBeenCalledWith("/users");
  });

  it("invokes logout from the header", async () => {
    const { onLogout } = renderShell();
    await userEvent.click(screen.getByTestId("logout-button"));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("toggles the responsive nav via the ViewModel and closes it after selecting", async () => {
    const { viewModel } = renderShell();
    const toggle = screen.getByTestId("nav-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(toggle);
    expect(viewModel.getState().mobileNavOpen).toBe(true);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(screen.getByTestId("nav-levels"));
    expect(viewModel.getState().mobileNavOpen).toBe(false);
  });
});
