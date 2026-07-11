import { DailyChallengeView } from "@/presentation/daily-challenge/DailyChallengeView";
import { useDailyChallenge } from "./useDailyChallenge";

/** Route composition for the admin Daily Challenge section. */
export function AdminDailyChallengeRoute() {
  const viewModel = useDailyChallenge();
  return <DailyChallengeView {...viewModel} />;
}
