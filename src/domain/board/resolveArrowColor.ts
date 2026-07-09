/**
 * Named arrow colours → hex, mirroring the mobile client's `BoardView` palette so the
 * admin preview matches the game. Unknown names fall back to a neutral slate.
 */
const COLOR_HEX: Record<string, string> = {
  blue: "#4B6BFB",
  green: "#3FD06A",
  yellow: "#FFC83D",
  pink: "#FF6FD8",
  cyan: "#3FC8FF",
  purple: "#A06BFF",
  crimson: "#C23B57",
  white: "#EEF1FF",
  orange: "#FF9F1C",
  teal: "#22C9B6",
};

export const DEFAULT_ARROW_COLOR = "#94A3B8";

export function resolveArrowColor(name: string): string {
  return COLOR_HEX[name] ?? DEFAULT_ARROW_COLOR;
}
