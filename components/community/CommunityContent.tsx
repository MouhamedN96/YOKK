"use client"

import { useState } from "react"
import { Users, Trophy, Sparkles, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { calculateLevel, getLevelTitle } from "@/lib/types"
import type { Profile } from "@/lib/types"
import Link from "next/link"

interface CommunityContentProps {
  currentUser: Profile | null
  topContributors: Profile[]
  recentUsers: Profile[]
}

export function CommunityContent({ currentUser, topContributors, recentUsers }: CommunityContentProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = searchQuery
    ? recentUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : recentUsers

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Community
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Connect with builders across Africa</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
        />
      </div>

      {/* Top Contributors */}
      {!searchQuery && topContributors.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Contributors
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {topContributors.slice(0, 6).map((user, index) => (
              <UserCard key={user.id} user={user} rank={index + 1} currentUserId={currentUser?.id} />
            ))}
          </div>
        </section>
      )}

      {/* All Members / Search Results */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          {searchQuery ? "Search Results" : "Active Members"}
        </h2>
        {filteredUsers.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} currentUserId={currentUser?.id} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No members found" : "No community members yet. Be the first!"}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

interface UserCardProps {
  user: Profile
  rank?: number
  currentUserId?: string
}

function UserCard({ user, rank, currentUserId }: UserCardProps) {
  const { level } = calculateLevel(user.xp || 0)
  const title = getLevelTitle(level)
  const isCurrentUser = currentUserId === user.id

  return (
    <Link href={isCurrentUser ? "/profile" : `/u/${user.username}`}>
      <div className="glass-card rounded-xl p-4 hover:border-primary/40 transition-colors group">
        <div className="flex items-center gap-3">
          {rank && (
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                rank === 1
                  ? "bg-primary/20 text-primary"
                  : rank === 2
                    ? "bg-accent/20 text-accent"
                    : rank === 3
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-secondary text-muted-foreground"
              }`}
            >
              {rank}
            </div>
          )}
          <Avatar className="h-12 w-12 border border-border group-hover:border-primary/50 transition-colors">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary">
              {user.full_name?.[0] || user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {user.full_name || user.username}
            </p>
            <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              Lv.{level}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">{title}</p>
          </div>
        </div>
        {user.bio && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{user.bio}</p>}
      </div>
    </Link>
  )
}
