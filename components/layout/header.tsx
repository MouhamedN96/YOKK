"use client"

import { useState } from "react"
import { Search, Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface HeaderProps {
  user?: {
    avatar_url?: string | null
    display_name?: string | null
    username: string
  } | null
}

export function Header({ user }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Menu button - mobile */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            Y
          </div>
          <span className="hidden font-bold text-lg text-foreground sm:inline-block">YOKK</span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles, jobs, tutorials..."
              className="w-full pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 h-10"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-accent-foreground">
              3
            </span>
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User avatar or auth */}
          {user ? (
            <Link href="/profile">
              <Avatar className="h-8 w-8 border border-primary/30">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {user.display_name?.[0] || user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
