import { useMemo } from "react";
import { ListAdminUsersUseCase } from "@/application/user/use-cases/ListAdminUsersUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { HttpAdminUserApi } from "@/infrastructure/user/HttpAdminUserApi";
import { useSession } from "@/framework/session/SessionContext";

export interface AdminUserServices {
  listUseCase: ListAdminUsersUseCase;
}

/** Composition root for the admin-users vertical, over one authenticated HTTP client. */
export function createAdminUserServices(httpClient: IHttpClient): AdminUserServices {
  return { listUseCase: new ListAdminUsersUseCase(new HttpAdminUserApi(httpClient)) };
}

/** Memoized services bound to the session's authenticated HTTP client. */
export function useAdminUserServices(): AdminUserServices {
  const { httpClient } = useSession();
  return useMemo(() => createAdminUserServices(httpClient), [httpClient]);
}
