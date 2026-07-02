export interface NavSection {
  id: string;
  path: string;
  label: string;
}

/** The three admin dashboard sections rendered in the shell nav. */
export const ADMIN_SECTIONS: readonly NavSection[] = [
  { id: "levels", path: "/levels", label: "Levels" },
  { id: "leaderboard", path: "/leaderboard", label: "Leaderboard" },
  { id: "users", path: "/users", label: "Users" },
];
