import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AdminLevelRow } from "@/application/level/AdminLevelRow";
import { LevelsView } from "@/presentation/level/LevelsView";

function row(overrides: Partial<AdminLevelRow>): AdminLevelRow {
  return {
    levelId: "l1",
    name: "Level 1",
    difficulty: "EASY",
    status: "DRAFT",
    arrowCount: 3,
    attempts: 5,
    createdAt: "2026-07-02T10:00:00.000Z",
    canPublish: true,
    canArchive: false,
    ...overrides,
  };
}

function renderView(props?: Partial<React.ComponentProps<typeof LevelsView>>) {
  const handlers = {
    onStatusFilterChange: vi.fn(),
    onView: vi.fn(),
    onPublish: vi.fn(),
    onArchive: vi.fn(),
  };
  render(
    <LevelsView
      rows={props?.rows ?? [row({})]}
      statusFilter={props?.statusFilter ?? "ALL"}
      isLoading={props?.isLoading ?? false}
      errorMessage={props?.errorMessage ?? null}
      pendingLevelId={props?.pendingLevelId ?? null}
      expandedLevelId={props?.expandedLevelId ?? null}
      {...handlers}
    />,
  );
  return handlers;
}

describe("LevelsView", () => {
  it("renders a row with its fields and formatted created date", () => {
    renderView({ rows: [row({ levelId: "l1", name: "Alpha", arrowCount: 7 })] });
    const row1 = screen.getByTestId("level-row-l1");
    expect(row1).toHaveTextContent("Alpha");
    expect(row1).toHaveTextContent("EASY");
    expect(row1).toHaveTextContent("7");
    expect(row1).toHaveTextContent("2026-07-02");
  });

  it("offers publish only when canPublish and archive only when canArchive", () => {
    renderView({
      rows: [
        row({ levelId: "d", status: "DRAFT", canPublish: true, canArchive: false }),
        row({ levelId: "p", status: "PUBLISHED", canPublish: false, canArchive: true }),
        row({ levelId: "a", status: "ARCHIVED", canPublish: false, canArchive: false }),
      ],
    });
    expect(screen.getByTestId("publish-d")).toBeInTheDocument();
    expect(screen.queryByTestId("archive-d")).not.toBeInTheDocument();
    expect(screen.getByTestId("archive-p")).toBeInTheDocument();
    expect(screen.queryByTestId("publish-p")).not.toBeInTheDocument();
    expect(screen.queryByTestId("publish-a")).not.toBeInTheDocument();
    expect(screen.queryByTestId("archive-a")).not.toBeInTheDocument();
  });

  it("raises publish, archive, view and filter intents", async () => {
    const handlers = renderView({
      rows: [row({ levelId: "p", status: "PUBLISHED", canPublish: false, canArchive: true })],
    });
    await userEvent.click(screen.getByTestId("archive-p"));
    expect(handlers.onArchive).toHaveBeenCalledWith("p");
    await userEvent.click(screen.getByTestId("view-p"));
    expect(handlers.onView).toHaveBeenCalledWith("p");
    await userEvent.selectOptions(screen.getByTestId("status-filter"), "PUBLISHED");
    expect(handlers.onStatusFilterChange).toHaveBeenCalledWith("PUBLISHED");
  });

  it("disables actions for the pending level", () => {
    renderView({
      rows: [row({ levelId: "d", status: "DRAFT", canPublish: true })],
      pendingLevelId: "d",
    });
    expect(screen.getByTestId("publish-d")).toBeDisabled();
  });

  it("shows the loading, error and empty states", () => {
    const { rerender } = renderLevels({ isLoading: true });
    expect(screen.getByTestId("levels-loading")).toBeInTheDocument();

    rerender({ isLoading: false, errorMessage: "Only draft levels can be published" });
    expect(screen.getByTestId("levels-error")).toHaveTextContent("Only draft levels can be published");

    rerender({ isLoading: false, rows: [] });
    expect(screen.getByTestId("levels-empty")).toBeInTheDocument();
  });

  it("reveals inline detail for the expanded level", () => {
    renderView({ rows: [row({ levelId: "l1", attempts: 9 })], expandedLevelId: "l1" });
    expect(screen.getByTestId("level-detail-l1")).toHaveTextContent("attempts: 9");
  });
});

// Local helper for the state-matrix test that needs re-render control.
function renderLevels(initial: Partial<React.ComponentProps<typeof LevelsView>>) {
  const base: React.ComponentProps<typeof LevelsView> = {
    rows: [
      {
        levelId: "l1",
        name: "Level 1",
        difficulty: "EASY",
        status: "DRAFT",
        arrowCount: 3,
        attempts: 5,
        createdAt: "2026-07-02T10:00:00.000Z",
        canPublish: true,
        canArchive: false,
      },
    ],
    statusFilter: "ALL",
    onStatusFilterChange: vi.fn(),
    onView: vi.fn(),
    onPublish: vi.fn(),
    onArchive: vi.fn(),
    isLoading: false,
    errorMessage: null,
    pendingLevelId: null,
    expandedLevelId: null,
  };
  const { rerender } = render(<LevelsView {...base} {...initial} />);
  return {
    rerender: (next: Partial<React.ComponentProps<typeof LevelsView>>) =>
      rerender(<LevelsView {...base} {...next} />),
  };
}
