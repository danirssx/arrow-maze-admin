import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AdminUser } from "@/application/user/AdminUser";
import { UsersView } from "@/presentation/user/UsersView";

function user(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    userId: "u1",
    email: "a@b.com",
    username: "admin_arrow",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-07-01T10:00:00.000Z",
    ...overrides,
  };
}

function renderView(props?: Partial<React.ComponentProps<typeof UsersView>>) {
  const handlers = { onPrev: vi.fn(), onNext: vi.fn() };
  render(
    <UsersView
      users={props?.users ?? [user()]}
      page={props?.page ?? 1}
      total={props?.total ?? 1}
      canPrev={props?.canPrev ?? false}
      canNext={props?.canNext ?? false}
      isLoading={props?.isLoading ?? false}
      errorMessage={props?.errorMessage ?? null}
      {...handlers}
    />,
  );
  return handlers;
}

describe("UsersView", () => {
  it("renders username, email, role, status and created date per row", () => {
    renderView({ users: [user({ userId: "u1", username: "mika", email: "mika@x.com", role: "USER" })] });
    const row = screen.getByTestId("user-row-u1");
    expect(row).toHaveTextContent("mika");
    expect(row).toHaveTextContent("mika@x.com");
    expect(row).toHaveTextContent("USER");
    expect(row).toHaveTextContent("ACTIVE");
    expect(row).toHaveTextContent("2026-07-01");
  });

  it("offers no user mutation actions (read-only): only pagination buttons exist", () => {
    renderView();
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("data-testid"))).toEqual([
      "users-prev",
      "users-next",
    ]);
  });

  it("shows loading, empty and error states", () => {
    const { rerender } = renderUsers({ isLoading: true });
    expect(screen.getByTestId("users-loading")).toBeInTheDocument();

    rerender({ isLoading: false, users: [] });
    expect(screen.getByTestId("users-empty")).toBeInTheDocument();

    rerender({ isLoading: false, errorMessage: "Admin access required" });
    expect(screen.getByTestId("users-error")).toHaveTextContent("Admin access required");
  });

  it("disables prev on the first page and next on the last page", async () => {
    const handlers = renderView({ page: 1, canPrev: false, canNext: true });
    expect(screen.getByTestId("users-prev")).toBeDisabled();
    await userEvent.click(screen.getByTestId("users-next"));
    expect(handlers.onNext).toHaveBeenCalledTimes(1);
  });
});

function renderUsers(initial: Partial<React.ComponentProps<typeof UsersView>>) {
  const base: React.ComponentProps<typeof UsersView> = {
    users: [user()],
    page: 1,
    total: 1,
    canPrev: false,
    canNext: false,
    onPrev: vi.fn(),
    onNext: vi.fn(),
    isLoading: false,
    errorMessage: null,
  };
  const { rerender } = render(<UsersView {...base} {...initial} />);
  return {
    rerender: (next: Partial<React.ComponentProps<typeof UsersView>>) =>
      rerender(<UsersView {...base} {...next} />),
  };
}
