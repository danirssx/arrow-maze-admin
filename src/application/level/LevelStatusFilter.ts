import type { LevelStatus } from "@/domain/level/LevelStatus";

/** The status filter the admin picks: a concrete status or "ALL" (no filter). */
export type LevelStatusFilter = LevelStatus | "ALL";

export const LEVEL_STATUS_FILTER_OPTIONS: readonly LevelStatusFilter[] = [
  "ALL",
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

/** Maps the UI filter to the backend `status` query param ("ALL" → no filter). */
export function toStatusQuery(filter: LevelStatusFilter): LevelStatus | undefined {
  return filter === "ALL" ? undefined : filter;
}
