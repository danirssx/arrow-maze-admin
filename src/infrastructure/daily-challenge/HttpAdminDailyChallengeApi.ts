// Pattern: Adapter
import type { DailyChallenge, DailyChallengeOperation } from "@/application/daily-challenge/DailyChallenge";
import type { AdminDailyChallengeApi } from "@/application/ports/AdminDailyChallengeApi";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import type {
  ApiEnvelope,
  DailyChallengeData,
  DailyChallengeOperationData,
} from "./DailyChallengeDtos";

/** Adapts the backend Daily Challenge endpoints to the admin application port. */
export class HttpAdminDailyChallengeApi implements AdminDailyChallengeApi {
  constructor(private readonly http: IHttpClient) {}

  async getCurrent(): Promise<DailyChallenge> {
    const res = await this.http.get<ApiEnvelope<DailyChallengeData>>("/daily-challenge");
    return res.data.data.challenge;
  }

  async startIteration(date?: string): Promise<DailyChallengeOperation> {
    const body = date === undefined ? undefined : { date };
    const res = await this.http.post<ApiEnvelope<DailyChallengeOperationData>>(
      "/admin/daily-challenge/iterations",
      body,
    );
    return res.data.data.operation;
  }

  async getOperation(operationId: string): Promise<DailyChallengeOperation> {
    const res = await this.http.get<ApiEnvelope<DailyChallengeOperationData>>(
      `/admin/daily-challenge/iterations/${encodeURIComponent(operationId)}`,
    );
    return res.data.data.operation;
  }
}
