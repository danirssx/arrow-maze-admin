export type DailyChallengeSource = "gemini" | "fallback";
export type DailyChallengeOperationStatus = "RUNNING" | "SUCCEEDED" | "FAILED";

export interface DailyChallengeArrow {
  id: string;
  color: string;
  path: Array<{ row: number; col: number }>;
  direction: string;
}

export interface DailyChallenge {
  date: string;
  seed: string;
  targetDifficulty: string;
  source: DailyChallengeSource;
  generatedAt: string;
  expiresAt: string;
  validation: {
    solvable: boolean;
    difficultyMatched: boolean;
    fallbackUsed: boolean;
  };
  level: {
    name: string;
    description: string;
    difficulty: string;
    definition: {
      attempts?: number;
      arrows: DailyChallengeArrow[];
      boardShape?: {
        type: string;
        cells: Array<{ row: number; col: number }>;
      };
      boardSize?: {
        rows: number;
        cols: number;
      };
    };
    timeLimitSeconds?: number;
  };
}

export interface DailyChallengeOperationEvent {
  sequence: number;
  type: string;
  message: string;
  createdAt: string;
  source?: DailyChallengeSource;
  fallbackUsed?: boolean;
}

export interface DailyChallengeOperation {
  operationId: string;
  date: string;
  status: DailyChallengeOperationStatus;
  requestedAt: string;
  completedAt: string | null;
  events: DailyChallengeOperationEvent[];
  challenge: DailyChallenge | null;
}
