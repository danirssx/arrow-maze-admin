import type { NavSection } from "./adminSections";

/**
 * Pure: returns the id of the section that owns the given path, or null. A section owns a
 * path when the path equals the section path or is nested under it (`/levels/123` →
 * `levels`). The longest matching section path wins, so more specific routes win over a
 * parent prefix.
 */
export function resolveActiveSection(
  pathname: string,
  sections: readonly NavSection[],
): string | null {
  let activeId: string | null = null;
  let bestLength = -1;
  for (const section of sections) {
    const owns = pathname === section.path || pathname.startsWith(`${section.path}/`);
    if (owns && section.path.length > bestLength) {
      activeId = section.id;
      bestLength = section.path.length;
    }
  }
  return activeId;
}
