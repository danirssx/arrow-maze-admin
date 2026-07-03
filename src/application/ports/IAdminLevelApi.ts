import type { LevelStatus } from "@/domain/level/LevelStatus";
import type { AdminLevelSummary } from "@/application/level/AdminLevelSummary";

/** Application port for the admin level-catalog endpoints. Adapter lives in infrastructure. */
export interface IAdminLevelApi {
  list(status?: LevelStatus): Promise<AdminLevelSummary[]>;
  /** Creates a DRAFT level from an already-shape-validated JSON value; returns its id. */
  create(level: unknown): Promise<string>;
  publish(levelId: string): Promise<void>;
  archive(levelId: string): Promise<void>;
}
