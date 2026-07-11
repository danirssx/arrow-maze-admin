import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type {
  DailyChallenge,
  DailyChallengeOperation,
} from "@/application/daily-challenge/DailyChallenge";
import { useDailyChallengeServices } from "./dailyChallengeServices";

const DAILY_CHALLENGE_QUERY_KEY = ["daily-challenge"] as const;

export interface DailyChallengeViewModel {
  challenge: DailyChallenge | null;
  operation: DailyChallengeOperation | null;
  isLoading: boolean;
  isIterating: boolean;
  errorMessage: string | null;
  iterationErrorMessage: string | null;
  onIterate: () => void;
}

function toErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  return null;
}

/** React Query view-model for the Daily Challenge admin screen. */
export function useDailyChallenge(): DailyChallengeViewModel {
  const { getDailyChallengeUseCase, startIterationUseCase, getOperationUseCase } =
    useDailyChallengeServices();
  const queryClient = useQueryClient();
  const [operationId, setOperationId] = useState<string | null>(null);

  const challengeQuery = useQuery({
    queryKey: DAILY_CHALLENGE_QUERY_KEY,
    queryFn: () => getDailyChallengeUseCase.execute(),
  });

  const operationQuery = useQuery({
    queryKey: ["daily-challenge-operation", operationId],
    queryFn: () => getOperationUseCase.execute(operationId as string),
    enabled: operationId !== null,
    refetchInterval: (query) => (query.state.data?.status === "RUNNING" ? 1000 : false),
  });

  const startMutation = useMutation({
    mutationFn: () => startIterationUseCase.execute(),
    onSuccess: (operation) => setOperationId(operation.operationId),
  });

  const operation = operationQuery.data ?? startMutation.data ?? null;

  useEffect(() => {
    if (operation?.status === "SUCCEEDED") {
      void queryClient.invalidateQueries({ queryKey: DAILY_CHALLENGE_QUERY_KEY });
    }
  }, [operation?.operationId, operation?.status, queryClient]);

  const isIterating =
    startMutation.isPending || operation?.status === "RUNNING" || operationQuery.isFetching;

  return {
    challenge: challengeQuery.data ?? null,
    operation,
    isLoading: challengeQuery.isLoading,
    isIterating,
    errorMessage: toErrorMessage(challengeQuery.error),
    iterationErrorMessage: toErrorMessage(startMutation.error) ?? toErrorMessage(operationQuery.error),
    onIterate: () => startMutation.mutate(),
  };
}
