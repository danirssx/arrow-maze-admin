import type {
  DailyChallenge,
  DailyChallengeOperation,
} from "@/application/daily-challenge/DailyChallenge";

export const dailyChallengeFixture: DailyChallenge = {
  date: "2026-07-11",
  seed: "daily-2026-07-11",
  targetDifficulty: "HARD",
  source: "gemini",
  generatedAt: "2026-07-11T14:00:00.000Z",
  expiresAt: "2026-07-12T00:00:00.000Z",
  validation: {
    solvable: true,
    difficultyMatched: true,
    fallbackUsed: false,
  },
  level: {
    name: "Daily Spiral",
    description: "A generated daily puzzle.",
    difficulty: "HARD",
    definition: {
      attempts: 5,
      arrows: [
        {
          id: "arrow-0",
          color: "#4B6BFB",
          path: [{ row: 0, col: 0 }],
          direction: "RIGHT",
        },
      ],
      boardShape: {
        type: "CELL_MASK",
        cells: [{ row: 0, col: 0 }],
      },
    },
    timeLimitSeconds: 120,
  },
};

export const fallbackChallengeFixture: DailyChallenge = {
  ...dailyChallengeFixture,
  source: "fallback",
  validation: {
    ...dailyChallengeFixture.validation,
    fallbackUsed: true,
  },
};

export const replacementChallengeFixture: DailyChallenge = {
  ...dailyChallengeFixture,
  seed: "daily-2026-07-11-replacement",
  level: {
    ...dailyChallengeFixture.level,
    name: "Replacement Daily",
  },
};

export const operationFixture: DailyChallengeOperation = {
  operationId: "op-1",
  date: "2026-07-11",
  status: "SUCCEEDED",
  requestedAt: "2026-07-11T14:00:00.000Z",
  completedAt: "2026-07-11T14:00:04.000Z",
  events: [
    {
      sequence: 1,
      type: "REQUESTED",
      message: "Daily challenge iteration requested",
      createdAt: "2026-07-11T14:00:00.000Z",
    },
    {
      sequence: 2,
      type: "CACHE_REPLACED",
      message: "Daily challenge cache replaced",
      source: "gemini",
      fallbackUsed: false,
      createdAt: "2026-07-11T14:00:04.000Z",
    },
  ],
  challenge: replacementChallengeFixture,
};
