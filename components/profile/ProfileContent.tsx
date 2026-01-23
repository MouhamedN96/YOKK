"use client"

import { useState } from "react"
import { Settings, Edit2, Calendar, Grid3X3, Bookmark, Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/feed/PostCard"
import { AchievementGrid } from "@/components/profile/AchievementGrid"
import { calculateLevel, getLevelTitle } from "@/lib/types"
import type { Profile, Post, Achievement, UserAchievement } from "@/lib/types"
import { format } from "date-fns"
import Link from "next/link"

interface ProfileContentProps {
  profile: Profile
  posts: Post[]
  userAchievements: (UserAchievement & { achievements: Achievement })[]
  allAchievements: Achievement[]
  followersCount: number
  followingCount: number
  isOwnProfile: boolean
}

export function ProfileContent({
  profile,
  posts,
  userAchievements,
  allAchievements,
  followersCount,
  followingCount,
  isOwnProfile,
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("posts")

  const { level, progress } = calculateLevel(profile.xp || 0)
  const title = getLevelTitle(level)

  const unlockedAchievementIds = new Set(userAchievements.map((ua) => ua.achievement_id))

  const achievementsWithStatus = allAchievements.map((a) => ({
    ...a,
    unlocked: unlockedAchievementIds.has(a.id),
    unlockedAt: userAchievements.find((ua) => ua.achievement_id === a.id)?.unlocked_at,
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Profile Header */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar and Level */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-primary yokk-glow">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                  {profile.full_name?.[0] || profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Level badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                Lv.{level}
              </div>
            </div>
            <Badge variant="outline" className="mt-3 border-primary/30 text-primary">
              {title}
            </Badge>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{profile.full_name || profile.username}</h1>
              <span className="text-muted-foreground">@{profile.username}</span>
            </div>

            {profile.bio && <p className="text-foreground mb-3">{profile.bio}</p>}

            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {format(new Date(profile.created_at), "MMM yyyy")}
              </span>
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-6 text-sm">
              <button className="hover:text-primary transition-colors">
                <span className="font-bold text-foreground">{followingCount}</span>{" "}
                <span className="text-muted-foreground">Following</span>
              </button>
              <button className="hover:text-primary transition-colors">
                <span className="font-bold text-foreground">{followersCount}</span>{" "}
                <span className="text-muted-foreground">Followers</span>
              </button>
              <span>
                <span className="font-bold text-primary">{(profile.xp || 0).toLocaleString()}</span>{" "}
                <span className="text-muted-foreground">XP</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2">
            {isOwnProfile ? (
              <>
                <Link href="/settings" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="sm" className="w-full border-border/50 bg-transparent">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Follow</Button>
            )}
          </div>
        </div>

        {/* XP Progress */}
        <div className="mt-6 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress to Level {level + 1}</span>
            <span className="text-primary font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full xp-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-secondary/50 p-1 rounded-xl mb-4">
          <TabsTrigger
            value="posts"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <Heart className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={{ ...post, profiles: profile }} />)
          ) : (
            <div className="glass-card rounded-xl p-12 text-center">
              <p className="text-muted-foreground">No posts yet. Share your first update!</p>
              <Link href="/compose">
                <Button className="mt-4 bg-primary text-primary-foreground">Create Post</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementGrid achievements={achievementsWithStatus} />
        </TabsContent>

        <TabsContent value="saved">
          <div className="glass-card rounded-xl p-12 text-center">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your saved posts will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
