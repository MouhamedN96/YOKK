"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Compass,
  Sparkles,
  Users,
  User,
  Bookmark,
  Settings,
  TrendingUp,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mainNavItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/trending", icon: TrendingUp, label: "Trending" },
  { href: "/community", icon: Users, label: "Community" },
]

const resourceNavItems = [
  { href: "/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/learn", icon: GraduationCap, label: "Learn" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
]

const userNavItems = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-14 bottom-0 border-r border-border/40 bg-sidebar p-4 overflow-y-auto">
      {/* Bo AI Button */}
      <Link
        href="/bo"
        className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors yokk-glow-sm"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <span className="font-semibold text-primary">Bo AI</span>
          <p className="text-xs text-muted-foreground">Your AI assistant</p>
        </div>
      </Link>

      {/* Main Nav */}
      <nav className="space-y-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Resources */}
      <div className="mt-8">
        <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resources</h3>
        <nav className="space-y-1">
          {resourceNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User */}
      <div className="mt-auto pt-4 border-t border-border/40">
        <nav className="space-y-1">
          {userNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
