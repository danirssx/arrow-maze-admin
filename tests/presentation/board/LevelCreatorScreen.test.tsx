import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LevelCreatorScreen } from "@/presentation/board/LevelCreatorScreen";
import { LevelCreatorViewModel } from "@/presentation/board/LevelCreatorViewModel";

const validJson = JSON.stringify({
  name: "My Level",
  description: "desc",
  difficulty: "EASY",
  arrows: [{ id: "a", color: "cyan", direction: "UP", path: [{ row: 1, col: 0 }, { row: 0, col: 0 }] }],
  boardShape: { type: "CELL_MASK", cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }] },
});

function renderScreen(onSubmit = vi.fn()) {
  const viewModel = new LevelCreatorViewModel(onSubmit);
  render(<LevelCreatorScreen viewModel={viewModel} />);
  return { onSubmit, viewModel };
}

function typeJson(json: string) {
  fireEvent.change(screen.getByTestId("json-input"), { target: { value: json } });
}

describe("LevelCreatorScreen", () => {
  it("always shows the expected schema", () => {
    renderScreen();
    expect(screen.getByTestId("schema-example")).toHaveTextContent('"type": "CELL_MASK"');
  });

  it("renders the board preview and enables submit for valid JSON", () => {
    renderScreen();
    typeJson(validJson);
    expect(screen.getByTestId("board-preview")).toBeInTheDocument();
    expect(screen.getByTestId("submit-level")).toBeEnabled();
    expect(screen.queryByTestId("validation-errors")).not.toBeInTheDocument();
  });

  it("shows inline errors and disables submit for invalid JSON", () => {
    renderScreen();
    typeJson(JSON.stringify({ arrows: [] }));
    expect(screen.getByTestId("validation-errors")).toBeInTheDocument();
    expect(screen.getByTestId("submit-level")).toBeDisabled();
    expect(screen.getByTestId("preview-placeholder")).toBeInTheDocument();
    expect(screen.queryByTestId("board-preview")).not.toBeInTheDocument();
  });

  it("shows a syntax error and disables submit for malformed JSON", () => {
    renderScreen();
    typeJson("{ not json");
    expect(screen.getByTestId("validation-errors")).toHaveTextContent("Invalid JSON");
    expect(screen.getByTestId("submit-level")).toBeDisabled();
  });

  it("emits the parsed value when submitting valid JSON", async () => {
    const { onSubmit } = renderScreen();
    typeJson(validJson);
    await userEvent.click(screen.getByTestId("submit-level"));
    expect(onSubmit).toHaveBeenCalledWith(JSON.parse(validJson));
  });
});
