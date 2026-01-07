import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ExploreContent } from "@/components/explore/explore-content"
import { demoPosts, demoCategories, demoCurrentUser } from "@/lib/demo-data"

export default function ExplorePage() {
  const firePosts = demoPosts.filter((p) => p.is_fire)
  const trendingPosts = [...demoPosts].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5)

  return (
    <div className="min-h-svh bg-background">
      <Header user={demoCurrentUser} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-safe lg:pb-4">
          <ExploreContent categories={demoCategories} trendingPosts={trendingPosts} firePosts={firePosts} />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
