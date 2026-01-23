import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { ExploreContent } from "@/components/explore/ExploreContent"
import { demoPosts, demoCategories, demoCurrentUser } from "@/lib/demo-data"

export default function ExplorePage() {
  // Use is_featured for "fire" posts (high engagement content)
  const firePosts = demoPosts.filter((p) => p.is_featured)
  const trendingPosts = [...demoPosts].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5)

  return (
    <div className="min-h-svh bg-background">
      <Header />
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
