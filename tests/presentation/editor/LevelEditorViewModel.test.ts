import { describe, expect, it, vi } from "vitest";
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
});
