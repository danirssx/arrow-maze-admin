import type { DailyChallenge } from "@/application/daily-challenge/DailyChallenge";
import type { AdminDailyChallengeApi } from "@/application/ports/AdminDailyChallengeApi";

/** Reads the current backend-owned Daily Challenge for admin inspection. */
export class GetDailyChallengeUseCase {
  constructor(private readonly api: AdminDailyChallengeApi) {}

  async execute(): Promise<DailyChallenge> {
    return this.api.getCurrent();
  }
}
