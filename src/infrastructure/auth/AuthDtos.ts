import type { UserRole } from "@/domain/auth/UserRole";

/** Backend wraps responses in `{ status: "success", data }` (ApiResponsePresenter). */
export interface ApiEnvelope<T> {
  status: "success";
  data: T;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  role: UserRole;
}

export interface RefreshResponseData {
  accessToken: string;
  refreshToken: string;
}
