import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { IAuthApi } from "@/application/ports/IAuthApi";
import type { ISessionStorage } from "@/application/ports/ISessionStorage";
import { RefreshSessionUseCase } from "@/application/auth/use-cases/RefreshSessionUseCase";

const session: AuthSession = {
  userId: "u1",
  username: "admin",
  role: "ADMIN",
  accessToken: "old-access",
  refreshToken: "old-refresh",
};

function makeStorage(current: AuthSession | null): ISessionStorage {
  return { save: vi.fn(), get: vi.fn(() => current), clear: vi.fn() };
}

describe("RefreshSessionUseCase", () => {
  it("returns null and does not call the API when there is no session", async () => {
    const authApi: IAuthApi = { login: vi.fn(), refresh: vi.fn(), logout: vi.fn() };
    const storage = makeStorage(null);

    const result = await new RefreshSessionUseCase(authApi, storage).execute();

    expect(result).toBeNull();
    expect(authApi.refresh).not.toHaveBeenCalled();
  });

  it("persists rotated tokens (preserving identity) and returns the new access token", async () => {
    const authApi: IAuthApi = {
      login: vi.fn(),
      refresh: vi.fn(async () => ({ accessToken: "new-access", refreshToken: "new-refresh" })),
      logout: vi.fn(),
    };
    const storage = makeStorage(session);

    const result = await new RefreshSessionUseCase(authApi, storage).execute();

    expect(authApi.refresh).toHaveBeenCalledWith("old-refresh");
    expect(storage.save).toHaveBeenCalledWith({
      userId: "u1",
      username: "admin",
      role: "ADMIN",
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    expect(result).toBe("new-access");
  });

  it("returns null when the refresh call fails", async () => {
    const authApi: IAuthApi = {
      login: vi.fn(),
      refresh: vi.fn(async () => {
        throw new Error("expired");
      }),
      logout: vi.fn(),
    };
    const storage = makeStorage(session);

    const result = await new RefreshSessionUseCase(authApi, storage).execute();

    expect(result).toBeNull();
    expect(storage.save).not.toHaveBeenCalled();
  });
});
