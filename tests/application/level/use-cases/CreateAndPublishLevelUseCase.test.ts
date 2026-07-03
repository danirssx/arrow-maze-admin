import { describe, expect, it, vi } from "vitest";
import type { IAdminLevelApi } from "@/application/ports/IAdminLevelApi";
import { CreateAndPublishLevelUseCase } from "@/application/level/use-cases/CreateAndPublishLevelUseCase";

const level = { name: "L", difficulty: "EASY", arrows: [] };

describe("CreateAndPublishLevelUseCase", () => {
  it("creates the draft then publishes the returned id and returns it", async () => {
    const calls: string[] = [];
    const api: IAdminLevelApi = {
      list: vi.fn(),
      create: vi.fn(async () => {
        calls.push("create");
        return "level-1";
      }),
      publish: vi.fn(async () => {
        calls.push("publish");
      }),
      archive: vi.fn(),
    };

    const result = await new CreateAndPublishLevelUseCase(api).execute(level);

    expect(result).toBe("level-1");
    expect(api.create).toHaveBeenCalledWith(level);
    expect(api.publish).toHaveBeenCalledWith("level-1");
    expect(calls).toEqual(["create", "publish"]);
  });

  it("propagates a create failure without publishing", async () => {
    const api: IAdminLevelApi = {
      list: vi.fn(),
      create: vi.fn(async () => {
        throw new Error("invalid ArrowSpec");
      }),
      publish: vi.fn(),
      archive: vi.fn(),
    };

    await expect(new CreateAndPublishLevelUseCase(api).execute(level)).rejects.toThrow(
      "invalid ArrowSpec",
    );
    expect(api.publish).not.toHaveBeenCalled();
  });

  it("propagates a publish failure (the draft is already created)", async () => {
    const api: IAdminLevelApi = {
      list: vi.fn(),
      create: vi.fn(async () => "level-2"),
      publish: vi.fn(async () => {
        throw new Error("not solvable");
      }),
      archive: vi.fn(),
    };

    await expect(new CreateAndPublishLevelUseCase(api).execute(level)).rejects.toThrow(
      "not solvable",
    );
    expect(api.create).toHaveBeenCalledTimes(1);
  });
});
