import type { DailyChallengeOperation } from "@/application/daily-challenge/DailyChallenge";
import type { AdminDailyChallengeApi } from "@/application/ports/AdminDailyChallengeApi";

/** Reads the sanitized operation log/status for a Daily Challenge iteration. */
export class GetDailyChallengeOperationUseCase {
  constructor(private readonly api: AdminDailyChallengeApi) {}

  async execute(operationId: string): Promise<DailyChallengeOperation> {
    return this.api.getOperation(operationId);
  }
}
