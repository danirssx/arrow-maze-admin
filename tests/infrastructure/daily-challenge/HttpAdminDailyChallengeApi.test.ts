import { describe, expect, it, vi } from "vitest";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { HttpAdminDailyChallengeApi } from "@/infrastructure/daily-challenge/HttpAdminDailyChallengeApi";
import { dailyChallengeFixture, operationFixture } from "../../application/fixtures/dailyChallengeFixtures";

function makeHttp() {
  const get = vi.fn(async (url: string) => {
    if (url === "/daily-challenge") {
      return { status: 200, data: { status: "success", data: { challenge: dailyChallengeFixture } } };
    }
    return { status: 200, data: { status: "success", data: { operation: operationFixture } } };
  });
  const post = vi.fn(async () => ({
    status: 202,
    data: { status: "success", data: { operation: operationFixture } },
  }));
  return { http: { get, post, put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient, get, post };
}

describe("HttpAdminDailyChallengeApi", () => {
  it("should_map_current_challenge_when_backend_returns_daily_challenge", async () => {
    const { http, get } = makeHttp();

    const result = await new HttpAdminDailyChallengeApi(http).getCurrent();

    expect(result).toEqual(dailyChallengeFixture);
    expect(get).toHaveBeenCalledWith("/daily-challenge");
  });

  it("should_start_iteration_when_date_is_provided", async () => {
    const { http, post } = makeHttp();

    const result = await new HttpAdminDailyChallengeApi(http).startIteration("2026-07-11");

    expect(result).toEqual(operationFixture);
    expect(post).toHaveBeenCalledWith("/admin/daily-challenge/iterations", {
      date: "2026-07-11",
    });
  });

  it("should_poll_operation_when_operation_id_is_known", async () => {
    const { http, get } = makeHttp();

    const result = await new HttpAdminDailyChallengeApi(http).getOperation("op-1");

    expect(result).toEqual(operationFixture);
    expect(get).toHaveBeenCalledWith("/admin/daily-challenge/iterations/op-1");
  });
});
