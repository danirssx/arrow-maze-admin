import type { UserRole } from "@/domain/auth/UserRole";

export interface AuthSession {
  userId: string;
  username: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}
