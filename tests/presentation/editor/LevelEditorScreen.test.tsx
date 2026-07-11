import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LevelEditorScreen } from "@/presentation/editor/LevelEditorScreen";
import { LevelEditorViewModel } from "@/presentation/editor/LevelEditorViewModel";

async function buildValidLevel() {
  await userEvent.click(screen.getByTestId("figure-SQUARE"));
  await userEvent.click(screen.getByTestId("cell-0-0"));
  await userEvent.click(screen.getByTestId("cell-0-1"));
  await userEvent.click(screen.getByTestId("dir-RIGHT"));
  await userEvent.click(screen.getByTestId("add-arrow"));
  await userEvent.type(screen.getByTestId("name-input"), "My Level");
}

describe("LevelEditorScreen", () => {
  it("paints an arrow, lists it, and enables publish once valid", async () => {
    const onPublish = vi.fn();
    render(<LevelEditorScreen viewModel={new LevelEditorViewModel(onPublish)} />);

    // grid cells become clickable once a figure is chosen
    await userEvent.click(screen.getByTestId("figure-SQUARE"));
    expect(screen.getByTestId("cell-0-0")).toBeEnabled();

    await userEvent.click(screen.getByTestId("cell-0-0"));
    await userEvent.click(screen.getByTestId("cell-0-1"));
    await userEvent.click(screen.getByTestId("dir-RIGHT"));
    await userEvent.click(screen.getByTestId("add-arrow"));

    expect(screen.getByTestId("arrow-item-arrow-1")).toBeInTheDocument();
    expect(screen.getByTestId("publish-level")).toBeDisabled(); // no name yet

    await userEvent.type(screen.getByTestId("name-input"), "My Level");
    expect(screen.getByTestId("publish-level")).toBeEnabled();
    expect(screen.getByTestId("board-preview")).toBeInTheDocument();
  });

  it("publishes the exported JSON", async () => {
    const onPublish = vi.fn();
    render(<LevelEditorScreen viewModel={new LevelEditorViewModel(onPublish)} />);
    await buildValidLevel();

    await userEvent.click(screen.getByTestId("publish-level"));
    expect(onPublish).toHaveBeenCalledWith(
      expect.objectContaining({ name: "My Level", boardShape: expect.objectContaining({ type: "CELL_MASK" }) }),
    );
  });

  it("paints a custom board shape and publishes its CELL_MASK (@s2, @s7)", async () => {
    const onPublish = vi.fn();
    render(<LevelEditorScreen viewModel={new LevelEditorViewModel(onPublish)} />);

    // switch to custom mode → the edit-board toggle appears and every cell is clickable
    await userEvent.click(screen.getByTestId("mode-CUSTOM"));
    expect(screen.getByTestId("edit-board")).toBeInTheDocument();
    expect(screen.getByTestId("cell-4-4")).toBeEnabled();

    // paint a custom L-shaped board mask
    await userEvent.click(screen.getByTestId("cell-0-0"));
    await userEvent.click(screen.getByTestId("cell-0-1"));

    // paint an arrow inside the custom mask
    await userEvent.click(screen.getByTestId("paint-arrows"));
    await userEvent.click(screen.getByTestId("cell-0-0"));
    await userEvent.click(screen.getByTestId("cell-0-1"));
    await userEvent.click(screen.getByTestId("dir-RIGHT"));
    await userEvent.click(screen.getByTestId("add-arrow"));
    await userEvent.type(screen.getByTestId("name-input"), "Custom");

    expect(screen.getByTestId("publish-level")).toBeEnabled();
    await userEvent.click(screen.getByTestId("publish-level"));
    expect(onPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        boardShape: { type: "CELL_MASK", cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
      }),
    );
  });

  it("shows domain validation errors and a server error", async () => {
    const viewModel = new LevelEditorViewModel(vi.fn());
    const { rerender } = render(<LevelEditorScreen viewModel={viewModel} />);
    // no figure/arrows yet → editor errors listed
    expect(screen.getByTestId("editor-errors")).toBeInTheDocument();

    rerender(<LevelEditorScreen viewModel={viewModel} serverError="Level definition contains a circular arrow blocking dependency" />);
    expect(screen.getByTestId("server-error")).toHaveTextContent("circular arrow");
  });
});
