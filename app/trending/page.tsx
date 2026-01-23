import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { TrendingContent } from "@/components/trending/TrendingContent"
import { demoCurrentUser, demoPosts } from "@/lib/demo-data"

export default function TrendingPage() {
  const sortedPosts = [...demoPosts].sort((a, b) => b.upvotes - a.upvotes)

  return (
    <div className="min-h-svh bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-safe lg:pb-4">
          <TrendingContent
            todayPosts={sortedPosts.slice(0, 3)}
            weekPosts={sortedPosts.slice(0, 5)}
            monthPosts={sortedPosts}
          />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
