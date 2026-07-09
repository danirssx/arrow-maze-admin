import { isAdminRole } from "@/domain/auth/AdminAccessPolicy";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { IAuthApi, LoginInput } from "@/application/ports/IAuthApi";

export interface LoginResult {
  session: AuthSession;
  isAdmin: boolean;
}

/**
 * Logs in against the backend and reports whether the account may access the admin
 * dashboard. The ADMIN decision (domain policy) is computed here so presentation never
 * imports domain; persistence is the framework's job (only admin sessions are kept).
 */
export class LoginUseCase {
  constructor(private readonly authApi: IAuthApi) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const session = await this.authApi.login(input);
    return { session, isAdmin: isAdminRole(session.role) };
  }
}
