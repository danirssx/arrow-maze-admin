import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LeaderboardEntry } from "@/application/leaderboard/Leaderboard";
import { LeaderboardView, type LeaderboardLevelOption } from "@/presentation/leaderboard/LeaderboardView";

const levels: LeaderboardLevelOption[] = [
  { levelId: "l1", name: "Alpha", status: "PUBLISHED" },
  { levelId: "l2", name: "Beta", status: "ARCHIVED" },
];

const entry: LeaderboardEntry = {
  entryId: "e1",
  userId: "u1",
  usernameSnapshot: "mika",
  score: 900,
  timeSeconds: 12,
  movesCount: 8,
  rank: 1,
  submittedAt: "2026-07-01T10:00:00.000Z",
};

function renderView(props?: Partial<React.ComponentProps<typeof LeaderboardView>>) {
  const onSelectLevel = props?.onSelectLevel ?? vi.fn();
  render(
    <LeaderboardView
      levels={props?.levels ?? levels}
      selectedLevelId={props?.selectedLevelId ?? null}
      onSelectLevel={onSelectLevel}
      entries={props?.entries ?? []}
      isLevelsLoading={props?.isLevelsLoading ?? false}
      isLoading={props?.isLoading ?? false}
      errorMessage={props?.errorMessage ?? null}
    />,
  );
  return { onSelectLevel };
}

describe("LeaderboardView", () => {
  it("lists levels including ARCHIVED and prompts before a level is selected", () => {
    renderView();
    const select = screen.getByTestId("leaderboard-level-select");
    expect(select).toHaveTextContent("Alpha (PUBLISHED)");
    expect(select).toHaveTextContent("Beta (ARCHIVED)");
    expect(screen.getByTestId("leaderboard-neutral")).toBeInTheDocument();
  });

  it("renders rank, player, score, time, moves and submitted date for entries", () => {
    renderView({ selectedLevelId: "l1", entries: [entry] });
    const row = screen.getByTestId("entry-row-e1");
    expect(row).toHaveTextContent("1");
    expect(row).toHaveTextContent("mika");
    expect(row).toHaveTextContent("900");
    expect(row).toHaveTextContent("12s");
    expect(row).toHaveTextContent("8");
    expect(row).toHaveTextContent("2026-07-01");
  });

  it("shows an empty state for a selected level with no scores", () => {
    renderView({ selectedLevelId: "l1", entries: [] });
    expect(screen.getByTestId("leaderboard-empty")).toBeInTheDocument();
  });

  it("shows a backend error while keeping the selector usable", () => {
    renderView({ selectedLevelId: "l1", errorMessage: "Level not found: x" });
    expect(screen.getByTestId("leaderboard-error")).toHaveTextContent("Level not found");
    expect(screen.getByTestId("leaderboard-level-select")).toBeEnabled();
  });

  it("offers no score submit/edit/delete action (read-only): no buttons", () => {
    renderView({ selectedLevelId: "l1", entries: [entry] });
    expect(screen.queryAllByRole("button")).toEqual([]);
  });
});
