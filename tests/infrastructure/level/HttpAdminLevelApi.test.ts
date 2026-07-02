import { describe, expect, it, vi } from "vitest";
import type { HttpResponse, IHttpClient } from "@/application/ports/IHttpClient";
import { HttpAdminLevelApi } from "@/infrastructure/level/HttpAdminLevelApi";

function makeHttp(getResponse?: HttpResponse): {
  http: IHttpClient;
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
} {
  const get = vi.fn(async () => getResponse ?? { data: { status: "success", data: { levels: [] } }, status: 200 });
  const post = vi.fn(async () => ({ data: { status: "success", data: { levelId: "x" } }, status: 200 }));
  const http = { get, post, put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient;
  return { http, get, post };
}

const listResponse: HttpResponse = {
  status: 200,
  data: {
    status: "success",
    data: {
      levels: [
        {
          levelId: "l1",
          name: "One",
          difficulty: "EASY",
          status: "DRAFT",
          arrowCount: 3,
          attempts: 5,
          createdAt: "2026-07-02T10:00:00.000Z",
        },
        {
          levelId: "l2",
          name: "Two",
          difficulty: "HARD",
          status: "PUBLISHED",
          arrowCount: 8,
          attempts: 3,
          timeLimitSeconds: 90,
          createdAt: "2026-07-01T09:00:00.000Z",
        },
      ],
    },
  },
};

describe("HttpAdminLevelApi", () => {
  it("lists levels without a status filter and maps the envelope", async () => {
    const { http, get } = makeHttp(listResponse);

    const levels = await new HttpAdminLevelApi(http).list();

    expect(get).toHaveBeenCalledWith("/admin/levels", undefined);
    expect(levels).toHaveLength(2);
    expect(levels[0]).toEqual({
      levelId: "l1",
      name: "One",
      difficulty: "EASY",
      status: "DRAFT",
      arrowCount: 3,
      attempts: 5,
      createdAt: "2026-07-02T10:00:00.000Z",
    });
    expect(levels[1]!.timeLimitSeconds).toBe(90);
  });

  it("passes the status as a query param when filtering", async () => {
    const { http, get } = makeHttp(listResponse);
    await new HttpAdminLevelApi(http).list("PUBLISHED");
    expect(get).toHaveBeenCalledWith("/admin/levels", { params: { status: "PUBLISHED" } });
  });

  it("posts to the publish endpoint with an encoded id", async () => {
    const { http, post } = makeHttp();
    await new HttpAdminLevelApi(http).publish("a b/c");
    expect(post).toHaveBeenCalledWith("/levels/a%20b%2Fc/publish");
  });

  it("posts to the archive endpoint", async () => {
    const { http, post } = makeHttp();
    await new HttpAdminLevelApi(http).archive("l2");
    expect(post).toHaveBeenCalledWith("/levels/l2/archive");
  });
});
