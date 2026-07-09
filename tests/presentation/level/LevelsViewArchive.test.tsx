import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AdminLevelRow } from "@/application/level/AdminLevelRow";
import { LevelsView } from "@/presentation/level/LevelsView";

function row(overrides: Partial<AdminLevelRow> = {}): AdminLevelRow {
  return {
    levelId: "l1",
    name: "Level 1",
    difficulty: "EASY",
    status: "PUBLISHED",
    arrowCount: 3,
    attempts: 5,
    createdAt: "2026-07-01T10:00:00.000Z",
    canPublish: false,
    canArchive: true,
    ...overrides,
  };
}

function renderView(props?: Partial<React.ComponentProps<typeof LevelsView>>) {
  const handlers = {
    onStatusFilterChange: vi.fn(),
    onView: vi.fn(),
    onPublish: vi.fn(),
    onArchive: vi.fn(),
    onCreate: vi.fn(),
  };
  render(
    <LevelsView
      rows={props?.rows ?? [row()]}
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

describe("LevelsView archive/replace (AD-07)", () => {
  it("explains archiving preserves score history, is not a deletion, and points to a replacement", () => {
    renderView();
    const note = screen.getByTestId("archive-note");
    expect(note).toHaveTextContent(/keeps its leaderboard and score history/i);
    expect(note).toHaveTextContent(/not a deletion/i);
    expect(note).toHaveTextContent(/New level/i);
  });

  it("labels the archive action as a soft, score-preserving transition on PUBLISHED rows", () => {
    renderView({ rows: [row({ levelId: "p", status: "PUBLISHED", canArchive: true })] });
    expect(screen.getByTestId("archive-p")).toHaveAttribute(
      "title",
      expect.stringMatching(/keeps its score history/i),
    );
  });

  it("does not offer archive again on ARCHIVED rows, which stay visible", () => {
    renderView({ rows: [row({ levelId: "a", status: "ARCHIVED", canArchive: false, canPublish: false })] });
    expect(screen.getByTestId("level-row-a")).toBeInTheDocument();
    expect(screen.queryByTestId("archive-a")).not.toBeInTheDocument();
  });

  it("exposes the replacement path (New level) as a direct action", async () => {
    const handlers = renderView();
    await userEvent.click(screen.getByTestId("new-level"));
    expect(handlers.onCreate).toHaveBeenCalledTimes(1);
  });

  it("shows a backend archive error without implying archive/replacement success", () => {
    renderView({ errorMessage: "Only published levels can be archived" });
    expect(screen.getByTestId("levels-error")).toHaveTextContent("Only published levels can be archived");
    // the note is static guidance, never an "archived successfully" confirmation
    expect(screen.queryByText(/archived successfully|success/i)).not.toBeInTheDocument();
  });
});
