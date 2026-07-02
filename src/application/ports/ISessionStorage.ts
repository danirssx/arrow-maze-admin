import type { AuthSession } from "@/application/auth/AuthSession";

/** Application port for persisting the authenticated session. Adapter in infrastructure. */
export interface ISessionStorage {
  save(session: AuthSession): void;
  get(): AuthSession | null;
  clear(): void;
}
