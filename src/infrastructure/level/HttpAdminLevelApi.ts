// Pattern: Adapter
import type { LevelDifficulty } from "@/domain/level/LevelDifficulty";
import type { LevelStatus } from "@/domain/level/LevelStatus";
import type { AdminLevelSummary } from "@/application/level/AdminLevelSummary";
import type { IAdminLevelApi } from "@/application/ports/IAdminLevelApi";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import type { AdminLevelDto, AdminLevelListData, ApiEnvelope } from "./AdminLevelDtos";

/** Adapts the backend admin level endpoints to the `IAdminLevelApi` port. */
export class HttpAdminLevelApi implements IAdminLevelApi {
  constructor(private readonly http: IHttpClient) {}

  async list(status?: LevelStatus): Promise<AdminLevelSummary[]> {
    const config = status === undefined ? undefined : { params: { status } };
    const res = await this.http.get<ApiEnvelope<AdminLevelListData>>("/admin/levels", config);
    return res.data.data.levels.map(HttpAdminLevelApi.toSummary);
  }

  async publish(levelId: string): Promise<void> {
    await this.http.post(`/levels/${encodeURIComponent(levelId)}/publish`);
  }

  async archive(levelId: string): Promise<void> {
    await this.http.post(`/levels/${encodeURIComponent(levelId)}/archive`);
  }

  private static toSummary(dto: AdminLevelDto): AdminLevelSummary {
    return {
      levelId: dto.levelId,
      name: dto.name,
      difficulty: dto.difficulty as LevelDifficulty,
      status: dto.status as LevelStatus,
      arrowCount: dto.arrowCount,
      attempts: dto.attempts,
      ...(dto.timeLimitSeconds !== undefined ? { timeLimitSeconds: dto.timeLimitSeconds } : {}),
      createdAt: dto.createdAt,
    };
  }
}
