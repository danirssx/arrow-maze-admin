import { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import { LogoutUseCase } from "@/application/auth/use-cases/LogoutUseCase";
import { RefreshSessionUseCase } from "@/application/auth/use-cases/RefreshSessionUseCase";
import type { IAuthApi } from "@/application/ports/IAuthApi";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import type { ISessionStorage } from "@/application/ports/ISessionStorage";
import { HttpAuthApi } from "@/infrastructure/auth/HttpAuthApi";
import { FetchHttpClient } from "@/infrastructure/http/FetchHttpClient";
import type { AppEnv } from "@/framework/config/env";

export interface AuthContainer {
  httpClient: IHttpClient;
  authApi: IAuthApi;
  loginUseCase: LoginUseCase;
  logoutUseCase: LogoutUseCase;
  refreshUseCase: RefreshSessionUseCase;
}

export interface AuthContainerParams {
  env: AppEnv;
  storage: ISessionStorage;
  /** Invalidate the session (clear storage + React state) after a 401 survives refresh. */
  onUnauthorized: () => void;
}

/**
 * Composition root for the auth vertical. The HTTP client's Bearer token, refresh-retry,
 * and unauthorized handler are wired here. `refresh` is passed lazily so the client can be
 * built before the refresh use case; `/auth/refresh` carries no Authorization header, so it
 * never re-triggers the 401 guard.
 */
export function createAuthContainer(params: AuthContainerParams): AuthContainer {
  const { env, storage, onUnauthorized } = params;

  // Break the client↔refresh cycle: the client calls `lazyRefresh.run`, which is swapped
  // for the real refresh once the use case (which itself needs the client) is built.
  const lazyRefresh: { run: () => Promise<string | null> } = { run: async () => null };
  const httpClient = new FetchHttpClient(
    env.apiBaseUrl,
    () => storage.get()?.accessToken ?? null,
    onUnauthorized,
    () => lazyRefresh.run(),
  );
  const authApi = new HttpAuthApi(httpClient);
  const refreshUseCase = new RefreshSessionUseCase(authApi, storage);
  lazyRefresh.run = () => refreshUseCase.execute();

  return {
    httpClient,
    authApi,
    loginUseCase: new LoginUseCase(authApi),
    logoutUseCase: new LogoutUseCase(authApi, storage),
    refreshUseCase,
  };
}
