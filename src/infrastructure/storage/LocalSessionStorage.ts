// Pattern: Adapter
import type { AuthSession } from "@/application/auth/AuthSession";
import type { ISessionStorage } from "@/application/ports/ISessionStorage";

const STORAGE_KEY = "arrow_maze_admin_session";

/** Persists the session in `localStorage`. */
export class LocalSessionStorage implements ISessionStorage {
  constructor(private readonly storage: Storage = window.localStorage) {}

  save(session: AuthSession): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  get(): AuthSession | null {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }

  clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }
}
