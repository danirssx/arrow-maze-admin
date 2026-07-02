import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { ISessionStorage } from "@/application/ports/ISessionStorage";
import { LocalSessionStorage } from "@/infrastructure/storage/LocalSessionStorage";
import { loadEnv } from "@/framework/config/env";
import { createAuthContainer, type AuthContainer } from "@/framework/composition/authContainer";
import { SessionContext, type SessionContextValue } from "./SessionContext";

interface SessionProviderProps {
  children: ReactNode;
  /** Overridable for tests (defaults to localStorage-backed storage). */
  storage?: ISessionStorage;
  /** Overridable for tests (defaults to the real composed auth container). */
  container?: AuthContainer;
}

/**
 * Framework composition root for the session. Bootstraps from storage, persists on
 * sign-in, and wires the HTTP client's `onUnauthorized` to clear both storage and React
 * state so an expired session (post-refresh 401) logs the user out.
 */
export function SessionProvider({ children, storage, container }: SessionProviderProps) {
  const storageRef = useRef<ISessionStorage>(storage ?? new LocalSessionStorage());
  const [session, setSession] = useState<AuthSession | null>(() => storageRef.current.get());

  const clearLocal = useCallback(() => {
    storageRef.current.clear();
    setSession(null);
  }, []);

  const containerRef = useRef<AuthContainer | null>(container ?? null);
  if (containerRef.current === null) {
    containerRef.current = createAuthContainer({
      env: loadEnv(),
      storage: storageRef.current,
      onUnauthorized: clearLocal,
    });
  }
  const activeContainer = containerRef.current;

  const signIn = useCallback((next: AuthSession) => {
    storageRef.current.save(next);
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    await activeContainer.logoutUseCase.execute();
    setSession(null);
  }, [activeContainer]);

  const value = useMemo<SessionContextValue>(
    () => ({ session, signIn, signOut, loginUseCase: activeContainer.loginUseCase }),
    [session, signIn, signOut, activeContainer],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
