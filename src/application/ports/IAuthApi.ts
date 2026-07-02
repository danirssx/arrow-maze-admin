import type { AuthSession } from "@/application/auth/AuthSession";

export interface LoginInput {
  email: string;
  rawPassword: string;
}

export interface RefreshTokens {
  accessToken: string;
  refreshToken: string;
}

/** Application port for the backend auth endpoints. */
export interface IAuthApi {
  login(input: LoginInput): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<RefreshTokens>;
  logout(refreshToken: string): Promise<void>;
}
