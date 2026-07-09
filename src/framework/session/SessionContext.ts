import { createContext, useContext } from "react";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";

export interface SessionContextValue {
  session: AuthSession | null;
  /** Persist an authenticated (admin) session and update React state. */
  signIn: (session: AuthSession) => void;
  /** Revoke on the server (best effort) and clear the local session. */
  signOut: () => Promise<void>;
  /** Exposed so route components can build the login ViewModel from the composed use case. */
  loginUseCase: LoginUseCase;
  /** The authenticated HTTP client (Bearer + 401 refresh) for feature data services. */
  httpClient: IHttpClient;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (value === null) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return value;
}
