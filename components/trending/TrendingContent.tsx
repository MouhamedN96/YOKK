"use client"

import { useState } from "react"
import { TrendingUp, Clock, Calendar, Flame } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "@/components/feed/PostCard"
import type { PostWithProfile } from "@/lib/supabase/types"

interface TrendingContentProps {
  todayPosts: PostWithProfile[]
  weekPosts: PostWithProfile[]
  monthPosts: PostWithProfile[]
}

export function TrendingContent({ todayPosts, weekPosts, monthPosts }: TrendingContentProps) {
  const [timeframe, setTimeframe] = useState("today")

  const getPostsForTimeframe = () => {
    switch (timeframe) {
      case "today":
        return todayPosts
      case "week":
        return weekPosts
      case "month":
        return monthPosts
      default:
        return todayPosts
    }
  }

  const posts = getPostsForTimeframe()

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Trending
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Discover what the community is talking about</p>
      </div>

      {/* Timeframe tabs */}
      <Tabs value={timeframe} onValueChange={setTimeframe} className="mb-6">
        <TabsList className="bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger
            value="today"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <Clock className="h-4 w-4 mr-2" />
            Today
          </TabsTrigger>
          <TabsTrigger
            value="week"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <Flame className="h-4 w-4 mr-2" />
            This Week
          </TabsTrigger>
          <TabsTrigger
            value="month"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <Calendar className="h-4 w-4 mr-2" />
            This Month
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Posts list */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={post.id} className="flex gap-4">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? "bg-primary/20 text-primary yokk-glow-sm"
                    : index === 1
                      ? "bg-accent/20 text-accent"
                      : index === 2
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-secondary text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <PostCard post={post} />
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No trending posts {timeframe === "today" ? "today" : timeframe === "week" ? "this week" : "this month"}{" "}
              yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
