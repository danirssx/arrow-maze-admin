import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { AdminUser } from "@/application/user/AdminUser";
import { useAdminUserServices } from "./adminUserServices";

const USERS_QUERY_KEY = "admin-users";
const DEFAULT_LIMIT = 20;

/** View state + intents the users screen renders (a hook-based MVVM view-model). */
export interface AdminUsersViewModel {
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

function toErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  return null;
}

/**
 * React Query view-model for the read-only users screen: fetches the current page and owns the
 * page state; pagination availability is driven by the backend `total`/`page`/`limit` metadata.
 */
export function useAdminUsers(): AdminUsersViewModel {
  const { listUseCase } = useAdminUserServices();
  const [page, setPage] = useState(1);
  const limit = DEFAULT_LIMIT;

  const query = useQuery({
    queryKey: [USERS_QUERY_KEY, page, limit],
    queryFn: () => listUseCase.execute(page, limit),
  });

  const total = query.data?.total ?? 0;
  const canPrev = page > 1;
  const canNext = page * limit < total;

  return {
    users: query.data?.users ?? [],
    page,
    total,
    canPrev,
    canNext,
    onPrev: () => setPage((current) => Math.max(1, current - 1)),
    onNext: () => setPage((current) => current + 1),
    isLoading: query.isLoading,
    errorMessage: toErrorMessage(query.error),
  };
}
