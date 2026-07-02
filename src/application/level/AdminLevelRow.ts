import type { AdminLevelSummary } from "./AdminLevelSummary";

/**
 * A levels-table row: the summary plus the actions the lifecycle allows. The `canPublish` /
 * `canArchive` flags are computed in the application layer (via the domain policy) so the
 * presentation never imports domain.
 */
export interface AdminLevelRow extends AdminLevelSummary {
  canPublish: boolean;
  canArchive: boolean;
}
