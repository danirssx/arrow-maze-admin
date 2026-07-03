import type { IAdminLevelApi } from "@/application/ports/IAdminLevelApi";

/**
 * The admin authoring flow: create a DRAFT from the (client-shape-validated) level JSON,
 * then publish it so it appears in the game. The backend is the source of truth — create
 * rejects invalid ArrowSpec/containment and publish rejects a non-solvable DAG; either
 * failure propagates (with the backend message) so the creator can show it. Returns the new
 * level id on full success. A failed publish leaves the DRAFT (visible in the admin list).
 */
export class CreateAndPublishLevelUseCase {
  constructor(private readonly api: IAdminLevelApi) {}

  async execute(level: unknown): Promise<string> {
    const levelId = await this.api.create(level);
    await this.api.publish(levelId);
    return levelId;
  }
}
