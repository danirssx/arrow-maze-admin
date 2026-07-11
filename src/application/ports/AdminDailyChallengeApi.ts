import type {
  DailyChallenge,
  DailyChallengeOperation,
} from "@/application/daily-challenge/DailyChallenge";

export interface AdminDailyChallengeApi {
  getCurrent(): Promise<DailyChallenge>;
  startIteration(date?: string): Promise<DailyChallengeOperation>;
  getOperation(operationId: string): Promise<DailyChallengeOperation>;
}
