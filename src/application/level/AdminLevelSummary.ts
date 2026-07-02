import type { LevelDifficulty } from "@/domain/level/LevelDifficulty";
import type { LevelStatus } from "@/domain/level/LevelStatus";

/** A level row as returned by `GET /admin/levels` (createdAt is an ISO string over the wire). */
export interface AdminLevelSummary {
  levelId: string;
  name: string;
  difficulty: LevelDifficulty;
  status: LevelStatus;
  arrowCount: number;
  attempts: number;
  timeLimitSeconds?: number;
  createdAt: string;
}
