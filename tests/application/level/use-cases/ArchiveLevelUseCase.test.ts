import { describe, expect, it, vi } from "vitest";
import type { IAdminLevelApi } from "@/application/ports/IAdminLevelApi";
import { ArchiveLevelUseCase } from "@/application/level/use-cases/ArchiveLevelUseCase";

describe("ArchiveLevelUseCase", () => {
  it("archives the given level via the api", async () => {
    const api: IAdminLevelApi = { list: vi.fn(), create: vi.fn(), publish: vi.fn(), archive: vi.fn(async () => {}) };
    await new ArchiveLevelUseCase(api).execute("level-7");
    expect(api.archive).toHaveBeenCalledWith("level-7");
  });
});
