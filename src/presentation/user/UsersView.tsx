import type { AdminUser } from "@/application/user/AdminUser";
import { formatCreatedAt } from "@/presentation/level/formatCreatedAt";

interface UsersViewProps {
  users: AdminUser[];
  page: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

/**
 * MVVM view — read-only admin users table. Dumb: renders the page of users + pagination view
 * state and raises prev/next intents. No user mutation (edit/suspend/delete/role/password) is
 * ever offered, and `passwordHash` is not part of the row model.
 */
export function UsersView({
  users,
  page,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
  isLoading,
  errorMessage,
}: UsersViewProps) {
  return (
    <section data-testid="users-view">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-text-primary">Users</h1>
        <span className="text-xs text-text-muted" data-testid="users-total">
          {total} total
        </span>
      </div>

      {errorMessage !== null ? (
        <p data-testid="users-error" className="mb-4 rounded-xl bg-reward-orange/10 px-4 py-3 text-sm font-semibold text-primary-900">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <p data-testid="users-loading" className="text-sm text-text-secondary">
          Loading users…
        </p>
      ) : users.length === 0 ? (
        <p data-testid="users-empty" className="text-sm text-text-secondary">
          No users found.
        </p>
      ) : (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border-soft text-text-muted">
              <th className="py-2 pr-3 font-semibold">Username</th>
              <th className="py-2 pr-3 font-semibold">Email</th>
              <th className="py-2 pr-3 font-semibold">Role</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="py-2 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId} data-testid={`user-row-${user.userId}`} className="border-b border-border-soft">
                <td className="py-2 pr-3 font-semibold text-text-primary">{user.username}</td>
                <td className="py-2 pr-3 text-text-secondary">{user.email}</td>
                <td className="py-2 pr-3 text-text-secondary">{user.role}</td>
                <td className="py-2 pr-3 text-text-secondary">{user.status}</td>
                <td className="py-2 text-text-secondary">{formatCreatedAt(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          data-testid="users-prev"
          disabled={!canPrev}
          onClick={onPrev}
          className="rounded-lg border border-border-soft px-3 py-1 text-xs font-bold text-text-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-xs text-text-secondary" data-testid="users-page">
          Page {page}
        </span>
        <button
          type="button"
          data-testid="users-next"
          disabled={!canNext}
          onClick={onNext}
          className="rounded-lg border border-border-soft px-3 py-1 text-xs font-bold text-text-secondary disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}
