import { describe, expect, it, vi } from "vitest";
import { figureById } from "@/domain/editor/boardFigures";
import { LevelEditorViewModel } from "@/presentation/editor/LevelEditorViewModel";

function paintValidArrow(vm: LevelEditorViewModel): void {
  vm.selectFigure("SQUARE");
  vm.paintCell({ row: 0, col: 0 });
  vm.paintCell({ row: 0, col: 1 });
  vm.setDirection("RIGHT");
  vm.setColor("cyan");
  vm.commitArrow();
}

describe("LevelEditorViewModel", () => {
  it("starts invalid and cannot publish", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    expect(vm.canPublish()).toBe(false);
    expect(vm.getState().model.figureId).toBeNull();
  });

  it("does not paint before a figure is selected", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    vm.paintCell({ row: 0, col: 0 });
    expect(vm.getState().draftPath).toEqual([]);
  });

  it("paints inside the mask and undoes the head on re-click", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    vm.selectFigure("SQUARE");
    vm.paintCell({ row: 0, col: 0 });
    vm.paintCell({ row: 0, col: 1 });
    expect(vm.getState().draftPath).toEqual([{ row: 0, col: 0 }, { row: 0, col: 1 }]);

    vm.paintCell({ row: 0, col: 1 }); // click head → undo
    expect(vm.getState().draftPath).toEqual([{ row: 0, col: 0 }]);
  });

  it("ignores a cell outside the mask", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    vm.selectFigure("DIAMOND"); // no cell at (0,0)
    vm.paintCell({ row: 0, col: 0 });
    expect(vm.getState().draftPath).toEqual([]);
  });

  it("commits the draft as an arrow and clears the draft", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    paintValidArrow(vm);
    expect(vm.getState().model.arrows).toHaveLength(1);
    expect(vm.getState().model.arrows[0]).toMatchObject({
      id: "arrow-1",
      color: "cyan",
      direction: "RIGHT",
      path: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
    });
    expect(vm.getState().draftPath).toEqual([]);
  });

  it("becomes publishable once name + figure + a valid arrow are set", () => {
    const onPublish = vi.fn();
    const vm = new LevelEditorViewModel(onPublish);
    paintValidArrow(vm);
    expect(vm.canPublish()).toBe(false); // still no name

    vm.setName("My Level");
    expect(vm.canPublish()).toBe(true);

    vm.publish();
    expect(onPublish).toHaveBeenCalledTimes(1);
    expect(onPublish).toHaveBeenCalledWith(
      expect.objectContaining({ name: "My Level", boardShape: expect.objectContaining({ type: "CELL_MASK" }) }),
    );
  });

  it("does not publish while invalid", () => {
    const onPublish = vi.fn();
    const vm = new LevelEditorViewModel(onPublish);
    paintValidArrow(vm); // no name → invalid
    vm.publish();
    expect(onPublish).not.toHaveBeenCalled();
  });

  it("removes an arrow", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    paintValidArrow(vm);
    vm.setName("L");
    expect(vm.canPublish()).toBe(true);
    vm.removeArrow("arrow-1");
    expect(vm.getState().model.arrows).toEqual([]);
    expect(vm.canPublish()).toBe(false);
  });

  // --- CUSTOM board authoring (MAZ-222) ---

  it("seeds the custom mask from the selected preset when entering CUSTOM mode (@s6)", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    vm.selectFigure("SQUARE");
    vm.setMode("CUSTOM");
    expect(vm.getState().model.mode).toBe("CUSTOM");
    expect(vm.getState().model.customCells).toHaveLength(figureById("SQUARE")!.cells.length);
  });

  it("seeds the mask when a preset is picked while already in CUSTOM mode (@s6)", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    vm.setMode("CUSTOM");
    vm.selectFigure("DIAMOND");
    expect(vm.getState().model.customCells).toHaveLength(figureById("DIAMOND")!.cells.length);
  });

  it("ignores mask toggles while in PRESET mode", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    vm.selectFigure("SQUARE");
    vm.toggleMaskCell({ row: 0, col: 0 });
    expect(vm.getState().model.customCells).toEqual([]);
  });

  it("cannot publish with an empty custom mask (@s1)", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    vm.setMode("CUSTOM");
    vm.setName("Custom");
    expect(vm.canPublish()).toBe(false);
  });

  it("builds and publishes a custom-shaped level with a CELL_MASK of the painted cells (@s5, @s7)", () => {
    const onPublish = vi.fn();
    const vm = new LevelEditorViewModel(onPublish);
    vm.setMode("CUSTOM"); // maskEditing on, empty mask
    vm.toggleMaskCell({ row: 0, col: 0 });
    vm.toggleMaskCell({ row: 0, col: 1 });
    vm.setMaskEditing(false); // paint arrows now
    vm.paintCell({ row: 0, col: 0 });
    vm.paintCell({ row: 0, col: 1 });
    vm.setDirection("RIGHT");
    vm.commitArrow();
    vm.setName("Custom Level");

    expect(vm.canPublish()).toBe(true);
    vm.publish();
    expect(onPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Custom Level",
        boardShape: { type: "CELL_MASK", cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
      }),
    );
  });

  it("allows publishing a disconnected custom mask (@s4)", () => {
    const vm = new LevelEditorViewModel(vi.fn());
    vm.setMode("CUSTOM");
    vm.toggleMaskCell({ row: 0, col: 0 });
    vm.toggleMaskCell({ row: 4, col: 4 }); // disconnected island
    vm.setMaskEditing(false);
    vm.paintCell({ row: 0, col: 0 });
    vm.setDirection("UP");
    vm.commitArrow();
    vm.setName("Islands");
    expect(vm.canPublish()).toBe(true);
  });
});
