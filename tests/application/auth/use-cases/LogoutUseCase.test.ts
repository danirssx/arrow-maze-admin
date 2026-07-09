import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { IAuthApi } from "@/application/ports/IAuthApi";
import type { ISessionStorage } from "@/application/ports/ISessionStorage";
import { LogoutUseCase } from "@/application/auth/use-cases/LogoutUseCase";

const session: AuthSession = {
  userId: "u1",
  username: "admin",
  role: "ADMIN",
  accessToken: "access",
  refreshToken: "refresh-token",
};

function makeStorage(current: AuthSession | null): ISessionStorage {
  return { save: vi.fn(), get: vi.fn(() => current), clear: vi.fn() };
}

describe("LogoutUseCase", () => {
  it("revokes with the stored refresh token and clears the session", async () => {
    const authApi: IAuthApi = { login: vi.fn(), refresh: vi.fn(), logout: vi.fn(async () => {}) };
    const storage = makeStorage(session);

    await new LogoutUseCase(authApi, storage).execute();

    expect(authApi.logout).toHaveBeenCalledWith("refresh-token");
    expect(storage.clear).toHaveBeenCalledTimes(1);
  });

  it("clears the session even when the server revoke fails", async () => {
    const authApi: IAuthApi = {
      login: vi.fn(),
      refresh: vi.fn(),
      logout: vi.fn(async () => {
        throw new Error("network");
      }),
    };
    const storage = makeStorage(session);

    await new LogoutUseCase(authApi, storage).execute();

    expect(storage.clear).toHaveBeenCalledTimes(1);
  });

  it("does not call the server when there is no stored session", async () => {
    const authApi: IAuthApi = { login: vi.fn(), refresh: vi.fn(), logout: vi.fn() };
    const storage = makeStorage(null);

    await new LogoutUseCase(authApi, storage).execute();

    expect(authApi.logout).not.toHaveBeenCalled();
    expect(storage.clear).toHaveBeenCalledTimes(1);
  });
});
