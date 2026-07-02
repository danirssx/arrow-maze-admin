import type { FormEvent } from "react";
import { useViewModelState } from "@/presentation/hooks/useViewModelState";
import type { LoginViewModel } from "./LoginViewModel";

/**
 * MVVM view — admin login form. Dumb: renders the ViewModel state and dispatches intents;
 * it holds no auth rules. Styled with the shared design tokens (client palette + Outfit).
 */
export function LoginScreen({ viewModel }: { viewModel: LoginViewModel }) {
  const state = useViewModelState(viewModel);
  const submitting = state.status === "submitting";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void viewModel.submit();
  };

  return (
    <main className="flex min-h-full items-center justify-center bg-background px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-border-soft bg-background-card p-8 shadow-sm"
      >
        <h1 className="text-2xl font-black text-text-primary">Arrow Maze Admin</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in with your admin account.</p>

        <label className="mt-6 block text-xs font-semibold text-text-secondary" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          data-testid="login-email"
          value={state.email}
          onChange={(e) => viewModel.setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-text-primary outline-none focus:border-primary-500"
          autoComplete="email"
        />

        <label className="mt-4 block text-xs font-semibold text-text-secondary" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          data-testid="login-password"
          value={state.password}
          onChange={(e) => viewModel.setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-text-primary outline-none focus:border-primary-500"
          autoComplete="current-password"
        />

        {state.errorMessage !== null ? (
          <p data-testid="login-error" className="mt-4 text-sm font-semibold text-primary-900">
            {state.errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          data-testid="login-submit"
          disabled={submitting}
          className="mt-6 w-full rounded-2xl bg-primary-700 px-6 py-3 font-bold text-text-inverse active:opacity-80 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
