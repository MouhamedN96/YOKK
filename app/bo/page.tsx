import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { BoChat } from "@/components/bo/bo-chat"
import { demoCurrentUser } from "@/lib/demo-data"

export default function BoPage() {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <Header user={demoCurrentUser} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-safe lg:pb-4 flex flex-col">
          <BoChat user={demoCurrentUser} />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
