import type { LevelStatus } from "./LevelStatus";

/**
 * Domain lifecycle rules for a level's status. Mirrors the backend transitions
 * (`Level.publish` / `Level.archive`): only a DRAFT can be published, only a PUBLISHED can
 * be archived. Pure — used to decide which row actions the admin may attempt; the server
 * remains authoritative.
 */
export function canPublish(status: LevelStatus): boolean {
  return status === "DRAFT";
}

export function canArchive(status: LevelStatus): boolean {
  return status === "PUBLISHED";
}
