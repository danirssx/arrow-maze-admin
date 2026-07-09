import type { IAdminLevelApi } from "@/application/ports/IAdminLevelApi";

/** Archives a published level (PUBLISHED → ARCHIVED). The server enforces the status rule. */
export class ArchiveLevelUseCase {
  constructor(private readonly api: IAdminLevelApi) {}

  async execute(levelId: string): Promise<void> {
    await this.api.archive(levelId);
  }
}
