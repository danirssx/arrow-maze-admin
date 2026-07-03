import { describe, expect, it, vi } from "vitest";
import { LevelCreatorViewModel } from "@/presentation/board/LevelCreatorViewModel";

const validJson = JSON.stringify({
  name: "My Level",
  description: "desc",
  difficulty: "EASY",
  arrows: [{ id: "a", color: "cyan", direction: "UP", path: [{ row: 0, col: 0 }] }],
});

describe("LevelCreatorViewModel", () => {
  it("starts empty and cannot submit", () => {
    const vm = new LevelCreatorViewModel(vi.fn());
    expect(vm.getState().review.status).toBe("empty");
    expect(vm.canSubmit()).toBe(false);
    expect(vm.previewSource()).toBeNull();
  });

  it("becomes valid and previewable for well-formed JSON", () => {
    const vm = new LevelCreatorViewModel(vi.fn());
    vm.setJsonText(validJson);
    expect(vm.getState().review.status).toBe("valid");
    expect(vm.canSubmit()).toBe(true);
    expect(vm.previewSource()).toEqual(JSON.parse(validJson));
  });

  it("stays un-submittable and hides the preview for invalid JSON", () => {
    const vm = new LevelCreatorViewModel(vi.fn());
    vm.setJsonText(JSON.stringify({ arrows: [] }));
    expect(vm.getState().review.status).toBe("invalid");
    expect(vm.canSubmit()).toBe(false);
    expect(vm.previewSource()).toBeNull();
  });

  it("emits the parsed value once on submit when valid", () => {
    const onSubmit = vi.fn();
    const vm = new LevelCreatorViewModel(onSubmit);
    vm.setJsonText(validJson);
    vm.submit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(JSON.parse(validJson));
  });

  it("does not submit when invalid", () => {
    const onSubmit = vi.fn();
    const vm = new LevelCreatorViewModel(onSubmit);
    vm.setJsonText("{ broken");
    vm.submit();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
