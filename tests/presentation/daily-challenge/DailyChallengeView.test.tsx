import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DailyChallengeView } from "@/presentation/daily-challenge/DailyChallengeView";
import {
  dailyChallengeFixture,
  fallbackChallengeFixture,
  operationFixture,
} from "../../application/fixtures/dailyChallengeFixtures";

function renderView(props?: Partial<React.ComponentProps<typeof DailyChallengeView>>) {
  const onIterate = props?.onIterate ?? vi.fn();
  render(
    <DailyChallengeView
      challenge={props?.challenge ?? dailyChallengeFixture}
      operation={props?.operation ?? null}
      isLoading={props?.isLoading ?? false}
      isIterating={props?.isIterating ?? false}
      errorMessage={props?.errorMessage ?? null}
      iterationErrorMessage={props?.iterationErrorMessage ?? null}
      onIterate={onIterate}
    />,
  );
  return { onIterate };
}

describe("DailyChallengeView", () => {
  it("should_render_board_metadata_and_activity_unavailable_when_challenge_exists", () => {
    renderView();

    expect(screen.getByRole("heading", { name: "Daily Challenge" })).toBeInTheDocument();
    expect(screen.getByTestId("board-preview")).toBeInTheDocument();
    expect(screen.getByText("Daily Spiral")).toBeInTheDocument();
    expect(screen.getByText("2026-07-11")).toBeInTheDocument();
    expect(screen.getAllByText("HARD")).toHaveLength(2);
    expect(screen.getByText("gemini")).toBeInTheDocument();
    expect(screen.getByText("solvable: true")).toBeInTheDocument();
    expect(screen.getByTestId("daily-activity-unavailable")).toHaveTextContent("not available");
  });

  it("should_show_fallback_and_utc_cache_metadata_when_fallback_challenge_exists", () => {
    renderView({ challenge: fallbackChallengeFixture });

    expect(screen.getByText("fallback")).toBeInTheDocument();
    expect(screen.getByText("fallbackUsed: true")).toBeInTheDocument();
    expect(screen.getByText("Generated UTC")).toBeInTheDocument();
    expect(screen.getByText("2026-07-11T14:00:00.000Z")).toBeInTheDocument();
    expect(screen.getByText("Expires UTC")).toBeInTheDocument();
    expect(screen.getByText("2026-07-12T00:00:00.000Z")).toBeInTheDocument();
  });

  it("should_render_ordered_operation_events_when_iteration_operation_exists", () => {
    renderView({ operation: operationFixture });

    const events = screen.getAllByTestId("daily-operation-event");
    expect(events[0]).toHaveTextContent("REQUESTED");
    expect(events[1]).toHaveTextContent("CACHE_REPLACED");
    expect(screen.getByTestId("daily-operation-status")).toHaveTextContent("SUCCEEDED");
  });

  it("should_disable_iterate_when_operation_is_running", () => {
    renderView({ isIterating: true });

    expect(screen.getByRole("button", { name: "Iterate daily challenge" })).toBeDisabled();
  });

  it("should_call_iterate_when_admin_clicks_action", async () => {
    const { onIterate } = renderView();

    await userEvent.click(screen.getByRole("button", { name: "Iterate daily challenge" }));

    expect(onIterate).toHaveBeenCalledTimes(1);
  });

  it("should_show_recoverable_errors_without_crashing", () => {
    renderView({ errorMessage: "Daily challenge unavailable", iterationErrorMessage: "Not found" });

    expect(screen.getByTestId("daily-load-error")).toHaveTextContent("Daily challenge unavailable");
    expect(screen.getByTestId("daily-iteration-error")).toHaveTextContent("Not found");
  });
});
