import type { AuthSession } from "@/application/auth/AuthSession";
import type { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import { ObservableViewModel } from "@/presentation/view-models/ObservableViewModel";
import { initialLoginUiState, type LoginUiState } from "./LoginUiState";

export const NON_ADMIN_MESSAGE = "This account is not an administrator.";
export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

/**
 * MVVM ViewModel for the login form. Holds presentation state only; the ADMIN decision
 * and the network call live behind `LoginUseCase`. On a successful admin login it invokes
 * `onAuthenticated`; a non-admin or a failed login sets an error message.
 */
export class LoginViewModel extends ObservableViewModel<LoginUiState> {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly onAuthenticated: (session: AuthSession) => void,
  ) {
    super(initialLoginUiState);
  }

  setEmail(email: string): void {
    this.setState({ ...this.getState(), email, status: "idle", errorMessage: null });
  }

  setPassword(password: string): void {
    this.setState({ ...this.getState(), password, status: "idle", errorMessage: null });
  }

  canSubmit(): boolean {
    const { email, password, status } = this.getState();
    return email.trim() !== "" && password !== "" && status !== "submitting";
  }

  async submit(): Promise<void> {
    if (!this.canSubmit()) return;
    const { email, password } = this.getState();
    this.setState({ ...this.getState(), status: "submitting", errorMessage: null });
    try {
      const result = await this.loginUseCase.execute({ email: email.trim(), rawPassword: password });
      if (result.isAdmin) {
        this.onAuthenticated(result.session);
        return;
      }
      this.setState({ ...this.getState(), status: "error", errorMessage: NON_ADMIN_MESSAGE });
    } catch {
      this.setState({ ...this.getState(), status: "error", errorMessage: INVALID_CREDENTIALS_MESSAGE });
    }
  }
}
