import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { FeedContent } from "@/components/feed/feed-content"
import { demoPosts, demoCategories, demoCurrentUser } from "@/lib/demo-data"

export default function HomePage() {
  const featuredPosts = demoPosts.filter((p) => p.is_featured)
  const regularPosts = demoPosts.filter((p) => !p.is_featured)

  return (
    <div className="min-h-svh bg-background">
      <Header user={demoCurrentUser} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-safe lg:pb-4">
          <FeedContent
            profile={demoCurrentUser}
            categories={demoCategories}
            featuredPosts={featuredPosts}
            posts={regularPosts}
          />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
