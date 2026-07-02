import { useMemo } from "react";
import { ArchiveLevelUseCase } from "@/application/level/use-cases/ArchiveLevelUseCase";
import { ListAdminLevelsUseCase } from "@/application/level/use-cases/ListAdminLevelsUseCase";
import { PublishLevelUseCase } from "@/application/level/use-cases/PublishLevelUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { HttpAdminLevelApi } from "@/infrastructure/level/HttpAdminLevelApi";
import { useSession } from "@/framework/session/SessionContext";

export interface AdminLevelServices {
  listUseCase: ListAdminLevelsUseCase;
  publishUseCase: PublishLevelUseCase;
  archiveUseCase: ArchiveLevelUseCase;
}

/** Composition root for the admin-level vertical: builds the use cases over one HTTP client. */
export function createAdminLevelServices(httpClient: IHttpClient): AdminLevelServices {
  const api = new HttpAdminLevelApi(httpClient);
  return {
    listUseCase: new ListAdminLevelsUseCase(api),
    publishUseCase: new PublishLevelUseCase(api),
    archiveUseCase: new ArchiveLevelUseCase(api),
  };
}

/** Memoized services bound to the session's authenticated HTTP client. */
export function useAdminLevelServices(): AdminLevelServices {
  const { httpClient } = useSession();
  return useMemo(() => createAdminLevelServices(httpClient), [httpClient]);
}
