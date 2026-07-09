import { describe, expect, it } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import { LocalSessionStorage } from "@/infrastructure/storage/LocalSessionStorage";

const session: AuthSession = {
  userId: "u1",
  username: "admin",
  role: "ADMIN",
  accessToken: "a",
  refreshToken: "r",
};

/** In-memory `Storage` so the test does not depend on jsdom's localStorage origin. */
class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe("LocalSessionStorage", () => {
  it("round-trips a saved session", () => {
    const storage = new LocalSessionStorage(new MemoryStorage());
    storage.save(session);
    expect(storage.get()).toEqual(session);
  });

  it("returns null when nothing is stored", () => {
    expect(new LocalSessionStorage(new MemoryStorage()).get()).toBeNull();
  });

  it("clears the stored session", () => {
    const storage = new LocalSessionStorage(new MemoryStorage());
    storage.save(session);
    storage.clear();
    expect(storage.get()).toBeNull();
  });

  it("returns null for a corrupted entry instead of throwing", () => {
    const backing = new MemoryStorage();
    backing.setItem("arrow_maze_admin_session", "{not json");
    expect(new LocalSessionStorage(backing).get()).toBeNull();
  });
});
