import { describe, expect, it, vi } from "vitest";
import type { AdminDailyChallengeApi } from "@/application/ports/AdminDailyChallengeApi";
import { GetDailyChallengeOperationUseCase } from "@/application/daily-challenge/use-cases/GetDailyChallengeOperationUseCase";
import { GetDailyChallengeUseCase } from "@/application/daily-challenge/use-cases/GetDailyChallengeUseCase";
import { StartDailyChallengeIterationUseCase } from "@/application/daily-challenge/use-cases/StartDailyChallengeIterationUseCase";
import { dailyChallengeFixture, operationFixture } from "../../fixtures/dailyChallengeFixtures";

function makeApi(): AdminDailyChallengeApi {
  return {
    getCurrent: vi.fn(async () => dailyChallengeFixture),
    startIteration: vi.fn(async () => operationFixture),
    getOperation: vi.fn(async () => operationFixture),
  };
}

describe("Daily Challenge use cases", () => {
  it("should_return_current_challenge_when_api_returns_current_challenge", async () => {
    const api = makeApi();

    const result = await new GetDailyChallengeUseCase(api).execute();

    expect(result).toEqual(dailyChallengeFixture);
    expect(api.getCurrent).toHaveBeenCalledTimes(1);
  });

  it("should_start_iteration_when_admin_requests_iteration", async () => {
    const api = makeApi();

    const result = await new StartDailyChallengeIterationUseCase(api).execute("2026-07-11");

    expect(result).toEqual(operationFixture);
    expect(api.startIteration).toHaveBeenCalledWith("2026-07-11");
  });

  it("should_return_operation_when_operation_id_is_requested", async () => {
    const api = makeApi();

    const result = await new GetDailyChallengeOperationUseCase(api).execute("op-1");

    expect(result).toEqual(operationFixture);
    expect(api.getOperation).toHaveBeenCalledWith("op-1");
  });
});
