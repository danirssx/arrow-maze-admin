import type { DailyChallengeOperation } from "@/application/daily-challenge/DailyChallenge";
import type { AdminDailyChallengeApi } from "@/application/ports/AdminDailyChallengeApi";

/** Starts the backend admin operation that manually iterates a Daily Challenge. */
export class StartDailyChallengeIterationUseCase {
  constructor(private readonly api: AdminDailyChallengeApi) {}

  async execute(date?: string): Promise<DailyChallengeOperation> {
    return this.api.startIteration(date);
  }
}
