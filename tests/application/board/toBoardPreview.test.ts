import { describe, expect, it } from "vitest";
import { DEFAULT_PREVIEW_CELL_SIZE, toBoardPreview } from "@/application/board/toBoardPreview";

const validRaw = {
  arrows: [{ id: "a", color: "cyan", direction: "UP", path: [{ row: 0, col: 0 }] }],
};

describe("toBoardPreview", () => {
  it("returns geometry for a valid level value using the default cell size", () => {
    const geometry = toBoardPreview(validRaw);
    expect(geometry).not.toBeNull();
    expect(geometry!.cellSize).toBe(DEFAULT_PREVIEW_CELL_SIZE);
    expect(geometry!.arrows).toHaveLength(1);
  });

  it("honours an explicit cell size", () => {
    const geometry = toBoardPreview(validRaw, 40);
    expect(geometry!.cellSize).toBe(40);
    expect(geometry!.width).toBe(40);
  });

  it("should_preview_the_full_rectangle_when_board_size_is_present", () => {
    const geometry = toBoardPreview({ ...validRaw, boardSize: { rows: 2, cols: 3 } }, 20);

    expect(geometry).not.toBeNull();
    expect(geometry!.width).toBe(60);
    expect(geometry!.height).toBe(40);
    expect(geometry!.cells).toHaveLength(6);
  });

  it("returns null for an invalid level value", () => {
    expect(toBoardPreview({ arrows: [] })).toBeNull();
    expect(toBoardPreview("nope")).toBeNull();
  });
});
