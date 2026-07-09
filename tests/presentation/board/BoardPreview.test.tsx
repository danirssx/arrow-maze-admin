import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BoardPreview } from "@/presentation/board/BoardPreview";

const validSource = {
  arrows: [
    { id: "v-top", color: "cyan", direction: "UP", path: [{ row: 1, col: 2 }, { row: 0, col: 2 }] },
    { id: "center", color: "pink", direction: "UP", path: [{ row: 2, col: 2 }] },
  ],
  boardShape: { type: "CELL_MASK", cells: [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }] },
};

describe("BoardPreview", () => {
  it("renders an SVG with the mask rects and arrow paths for valid JSON", () => {
    const { container } = render(<BoardPreview source={validSource} />);
    expect(screen.getByTestId("board-preview")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-v-top")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-center")).toBeInTheDocument();
    expect(container.querySelectorAll("rect")).toHaveLength(3);
    // multi-cell arrow draws a polyline; single-cell arrow only a head polygon
    expect(container.querySelectorAll("polyline")).toHaveLength(1);
    expect(container.querySelectorAll("polygon")).toHaveLength(2);
  });

  it("degrades to a fallback without crashing on invalid JSON", () => {
    render(<BoardPreview source={{ arrows: [] }} />);
    expect(screen.getByTestId("board-preview-invalid")).toBeInTheDocument();
    expect(screen.queryByTestId("board-preview")).not.toBeInTheDocument();
  });
});
