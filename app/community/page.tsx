import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { CommunityContent } from "@/components/community/community-content"
import { demoCurrentUser, demoProfiles } from "@/lib/demo-data"

export default function CommunityPage() {
  // Sort by XP for top contributors
  const topContributors = [...demoProfiles].sort((a, b) => (b.xp || 0) - (a.xp || 0))

  return (
    <div className="min-h-svh bg-background">
      <Header user={demoCurrentUser} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-safe lg:pb-4">
          <CommunityContent
            currentUser={demoCurrentUser}
            topContributors={topContributors}
            recentUsers={demoProfiles}
          />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
