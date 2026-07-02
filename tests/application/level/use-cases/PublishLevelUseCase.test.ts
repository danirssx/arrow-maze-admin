import { describe, expect, it, vi } from "vitest";
import type { IAdminLevelApi } from "@/application/ports/IAdminLevelApi";
import { PublishLevelUseCase } from "@/application/level/use-cases/PublishLevelUseCase";

describe("PublishLevelUseCase", () => {
  it("publishes the given level via the api", async () => {
    const api: IAdminLevelApi = { list: vi.fn(), publish: vi.fn(async () => {}), archive: vi.fn() };
    await new PublishLevelUseCase(api).execute("level-42");
    expect(api.publish).toHaveBeenCalledWith("level-42");
  });
});
