import type { IAdminLevelApi } from "@/application/ports/IAdminLevelApi";

/** Publishes a draft level (DRAFT → PUBLISHED). The server enforces solvability + status. */
export class PublishLevelUseCase {
  constructor(private readonly api: IAdminLevelApi) {}

  async execute(levelId: string): Promise<void> {
    await this.api.publish(levelId);
  }
}
