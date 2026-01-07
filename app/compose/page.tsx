import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ComposeForm } from "@/components/compose/compose-form"
import { demoCurrentUser, demoCategories } from "@/lib/demo-data"

export default function ComposePage() {
  return (
    <div className="min-h-svh bg-background">
      <Header user={demoCurrentUser} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-safe lg:pb-4">
          <ComposeForm user={demoCurrentUser} categories={demoCategories} />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
