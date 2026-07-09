import type { IAuthApi } from "@/application/ports/IAuthApi";
import type { ISessionStorage } from "@/application/ports/ISessionStorage";

/**
 * Refreshes the stored access token. Returns the new access token, or null when there is
 * no session or the refresh fails (the caller then invalidates the session). Used by the
 * HTTP client's 401 refresh-and-retry guard.
 */
export class RefreshSessionUseCase {
  constructor(
    private readonly authApi: IAuthApi,
    private readonly storage: ISessionStorage,
  ) {}

  async execute(): Promise<string | null> {
    const session = this.storage.get();
    if (session === null) {
      return null;
    }
    // Read outside the try so a missing session surfaces as a programmer error, not a
    // silently-swallowed refresh failure (keeps the null guard observable).
    const currentRefreshToken = session.refreshToken;
    try {
      const tokens = await this.authApi.refresh(currentRefreshToken);
      this.storage.save({
        ...session,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      return tokens.accessToken;
    } catch {
      return null;
    }
  }
}
