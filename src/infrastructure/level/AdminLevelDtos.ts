/** Backend wraps responses in `{ status:"success", data }` (ApiResponsePresenter). */
export interface ApiEnvelope<T> {
  status: "success";
  data: T;
}

export interface AdminLevelDto {
  levelId: string;
  name: string;
  difficulty: string;
  status: string;
  arrowCount: number;
  attempts: number;
  timeLimitSeconds?: number;
  createdAt: string;
}

export interface AdminLevelListData {
  levels: AdminLevelDto[];
}

export interface CreateLevelData {
  levelId: string;
}
