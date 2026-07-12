import type {
  DailyChallenge,
  DailyChallengeOperation,
} from "@/application/daily-challenge/DailyChallenge";

export interface ApiEnvelope<T> {
  status: "success";
  data: T;
}

export interface DailyChallengeData {
  challenge: DailyChallenge;
}

export interface DailyChallengeOperationData {
  operation: DailyChallengeOperation;
}
