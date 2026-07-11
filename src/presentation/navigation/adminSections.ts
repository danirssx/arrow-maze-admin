export interface NavSection {
  id: string;
  path: string;
  label: string;
}

/** Admin dashboard sections rendered in the shell nav. */
export const ADMIN_SECTIONS: readonly NavSection[] = [
  { id: "levels", path: "/levels", label: "Levels" },
  { id: "daily-challenge", path: "/daily-challenge", label: "Daily Challenge" },
  { id: "leaderboard", path: "/leaderboard", label: "Leaderboard" },
  { id: "users", path: "/users", label: "Users" },
];
