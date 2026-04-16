import { auth } from "@/auth";
import { getLeaderboard } from "@/actions/leaderboard";
import { LeaderboardClient } from "@/components/leaderboard";
import Navbar from "@/components/layout/navbar";

// Revalidate every 60 seconds so the page stays fresh without
// a full SSR hit on every request.
export const revalidate = 60;


export default async function LeaderboardPage() {
  const session = await auth();
  const entries = await getLeaderboard();
  const currentUserId = session?.user?.id;

  return(
    <>
      <Navbar />
      <LeaderboardClient entries={entries} currentUserId={currentUserId} />;
    </>
  ) 
}