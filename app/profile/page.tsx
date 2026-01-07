import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ProfileContent } from "@/components/profile/profile-content"
import { demoCurrentUser, demoPosts, demoAchievements, demoUserAchievements } from "@/lib/demo-data"

export default function ProfilePage() {
  const userPosts = demoPosts.filter((p) => p.user_id === "current-user" || p.user_id === "user-1")

  // Map user achievements with full achievement data
  const userAchievementsWithData = demoUserAchievements.map((ua) => ({
    ...ua,
    id: ua.achievement_id,
    user_id: demoCurrentUser.id,
    achievements: demoAchievements.find((a) => a.id === ua.achievement_id)!,
  }))

  return (
    <div className="min-h-svh bg-background">
      <Header user={demoCurrentUser} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-safe lg:pb-4">
          <ProfileContent
            profile={demoCurrentUser}
            posts={userPosts}
            userAchievements={userAchievementsWithData}
            allAchievements={demoAchievements}
            followersCount={127}
            followingCount={89}
            isOwnProfile={true}
          />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
