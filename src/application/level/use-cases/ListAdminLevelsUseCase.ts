import { canArchive, canPublish } from "@/domain/level/LevelStatusPolicy";
import type { LevelStatus } from "@/domain/level/LevelStatus";
import type { AdminLevelRow } from "@/application/level/AdminLevelRow";
import type { IAdminLevelApi } from "@/application/ports/IAdminLevelApi";

/**
 * Lists admin level rows, optionally filtered by status. Attaches the lifecycle action
 * flags (via the domain policy) so the presentation renders actions without importing
 * domain.
 */
export class ListAdminLevelsUseCase {
  constructor(private readonly api: IAdminLevelApi) {}

  async execute(status?: LevelStatus): Promise<AdminLevelRow[]> {
    const summaries = await this.api.list(status);
    return summaries.map((summary) => ({
      ...summary,
      canPublish: canPublish(summary.status),
      canArchive: canArchive(summary.status),
    }));
  }
}
