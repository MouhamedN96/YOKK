import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { LaunchContent } from "@/components/launch/launch-content"
import { demoCurrentUser, demoProducts } from "@/lib/demo-data"

export default function LaunchPage() {
  const featuredProducts = demoProducts.filter((p) => p.is_featured)
  const recentProducts = [...demoProducts].sort(
    (a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime(),
  )
  const topProducts = [...demoProducts].sort((a, b) => b.upvotes - a.upvotes)

  return (
    <div className="min-h-svh bg-background">
      <Header user={demoCurrentUser} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-safe lg:pb-4">
          <LaunchContent
            profile={demoCurrentUser}
            featuredProducts={featuredProducts}
            recentProducts={recentProducts}
            topProducts={topProducts}
          />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
