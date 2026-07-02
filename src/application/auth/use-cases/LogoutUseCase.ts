import type { IAuthApi } from "@/application/ports/IAuthApi";
import type { ISessionStorage } from "@/application/ports/ISessionStorage";

/**
 * Logs out: best-effort server revoke, then always clears the local session so the user
 * is signed out even if the network call fails.
 */
export class LogoutUseCase {
  constructor(
    private readonly authApi: IAuthApi,
    private readonly storage: ISessionStorage,
  ) {}

  async execute(): Promise<void> {
    const session = this.storage.get();
    if (session !== null) {
      // Read outside the try so the null guard stays observable (a swallowed exception
      // must not hide whether we actually had a session to revoke).
      const refreshToken = session.refreshToken;
      try {
        await this.authApi.logout(refreshToken);
      } catch {
        // Best effort: the local session is cleared regardless.
      }
    }
    this.storage.clear();
  }
}
