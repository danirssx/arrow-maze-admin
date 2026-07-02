import { describe, expect, it, vi } from "vitest";
import type { AdminLevelSummary } from "@/application/level/AdminLevelSummary";
import type { IAdminLevelApi } from "@/application/ports/IAdminLevelApi";
import { ListAdminLevelsUseCase } from "@/application/level/use-cases/ListAdminLevelsUseCase";

function summary(overrides: Partial<AdminLevelSummary>): AdminLevelSummary {
  return {
    levelId: "l1",
    name: "Level 1",
    difficulty: "EASY",
    status: "DRAFT",
    arrowCount: 3,
    attempts: 5,
    createdAt: "2026-07-02T10:00:00.000Z",
    ...overrides,
  };
}

function makeApi(summaries: AdminLevelSummary[]): IAdminLevelApi {
  return { list: vi.fn(async () => summaries), publish: vi.fn(), archive: vi.fn() };
}

describe("ListAdminLevelsUseCase", () => {
  it("forwards the status filter to the api", async () => {
    const api = makeApi([]);
    await new ListAdminLevelsUseCase(api).execute("PUBLISHED");
    expect(api.list).toHaveBeenCalledWith("PUBLISHED");
  });

  it("attaches lifecycle action flags per status and preserves the summary fields", async () => {
    const api = makeApi([
      summary({ levelId: "d", status: "DRAFT" }),
      summary({ levelId: "p", status: "PUBLISHED" }),
      summary({ levelId: "a", status: "ARCHIVED" }),
    ]);

    const rows = await new ListAdminLevelsUseCase(api).execute();

    expect(rows.map((r) => [r.levelId, r.canPublish, r.canArchive])).toEqual([
      ["d", true, false],
      ["p", false, true],
      ["a", false, false],
    ]);
    expect(rows[0]).toMatchObject({ name: "Level 1", difficulty: "EASY", arrowCount: 3, attempts: 5 });
  });
});
