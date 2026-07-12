import { useMemo } from "react";
import { GetDailyChallengeOperationUseCase } from "@/application/daily-challenge/use-cases/GetDailyChallengeOperationUseCase";
import { GetDailyChallengeUseCase } from "@/application/daily-challenge/use-cases/GetDailyChallengeUseCase";
import { StartDailyChallengeIterationUseCase } from "@/application/daily-challenge/use-cases/StartDailyChallengeIterationUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { HttpAdminDailyChallengeApi } from "@/infrastructure/daily-challenge/HttpAdminDailyChallengeApi";
import { useSession } from "@/framework/session/SessionContext";

export interface DailyChallengeServices {
  getDailyChallengeUseCase: GetDailyChallengeUseCase;
  startIterationUseCase: StartDailyChallengeIterationUseCase;
  getOperationUseCase: GetDailyChallengeOperationUseCase;
}

export function createDailyChallengeServices(httpClient: IHttpClient): DailyChallengeServices {
  const api = new HttpAdminDailyChallengeApi(httpClient);
  return {
    getDailyChallengeUseCase: new GetDailyChallengeUseCase(api),
    startIterationUseCase: new StartDailyChallengeIterationUseCase(api),
    getOperationUseCase: new GetDailyChallengeOperationUseCase(api),
  };
}

export function useDailyChallengeServices(): DailyChallengeServices {
  const { httpClient } = useSession();
  return useMemo(() => createDailyChallengeServices(httpClient), [httpClient]);
}
