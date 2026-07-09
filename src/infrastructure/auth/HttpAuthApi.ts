// Pattern: Adapter
import type { AuthSession } from "@/application/auth/AuthSession";
import type { IAuthApi, LoginInput, RefreshTokens } from "@/application/ports/IAuthApi";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import type { ApiEnvelope, LoginResponseData, RefreshResponseData } from "./AuthDtos";

/** Adapts the backend `/auth/*` endpoints to the `IAuthApi` port. */
export class HttpAuthApi implements IAuthApi {
  constructor(private readonly http: IHttpClient) {}

  async login(input: LoginInput): Promise<AuthSession> {
    const res = await this.http.post<ApiEnvelope<LoginResponseData>>("/auth/login", {
      email: input.email,
      rawPassword: input.rawPassword,
    });
    const data = res.data.data;
    return {
      userId: data.userId,
      username: data.username,
      role: data.role,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshTokens> {
    const res = await this.http.post<ApiEnvelope<RefreshResponseData>>("/auth/refresh", {
      refreshToken,
    });
    return { accessToken: res.data.data.accessToken, refreshToken: res.data.data.refreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.http.post("/auth/logout", { refreshToken });
  }
}
