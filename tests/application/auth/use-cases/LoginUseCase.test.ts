import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { IAuthApi, LoginInput } from "@/application/ports/IAuthApi";
import { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";

function makeSession(role: AuthSession["role"]): AuthSession {
  return {
    userId: "u1",
    username: "admin",
    role,
    accessToken: "access",
    refreshToken: "refresh",
  };
}

function makeAuthApi(session: AuthSession): IAuthApi {
  return {
    login: vi.fn(async () => session),
    refresh: vi.fn(),
    logout: vi.fn(),
  };
}

const input: LoginInput = { email: "a@b.com", rawPassword: "pw" };

describe("LoginUseCase", () => {
  it("reports isAdmin=true and returns the session for an ADMIN account", async () => {
    const session = makeSession("ADMIN");
    const authApi = makeAuthApi(session);

    const result = await new LoginUseCase(authApi).execute(input);

    expect(result).toEqual({ session, isAdmin: true });
    expect(authApi.login).toHaveBeenCalledWith(input);
  });

  it("reports isAdmin=false for a non-admin account while still returning the session", async () => {
    const session = makeSession("USER");

    const result = await new LoginUseCase(makeAuthApi(session)).execute(input);

    expect(result.isAdmin).toBe(false);
    expect(result.session).toEqual(session);
  });
});
