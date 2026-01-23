"use client"

import { TrendingUp, Flame, Sparkles } from "lucide-react"
import { PostCard } from "@/components/feed/PostCard"
import { Badge } from "@/components/ui/badge"
import type { PostWithProfile } from "@/lib/supabase/types"
import type { Category } from "@/lib/types"
import Link from "next/link"

interface ExploreContentProps {
  categories: Category[]
  trendingPosts: PostWithProfile[]
  firePosts: PostWithProfile[]
}

export function ExploreContent({ categories, trendingPosts, firePosts }: ExploreContentProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Categories grid */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Explore Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <div
                className="glass-card rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-pointer"
                style={{ borderColor: `${category.color}30` }}
              >
                <div
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <span className="text-2xl" style={{ color: category.color }}>
                    {category.name[0]}
                  </span>
                </div>
                <h3 className="font-medium text-foreground text-sm">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Fire posts */}
      {firePosts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent" />
            Hot Right Now
            <Badge className="bg-accent text-accent-foreground fire-badge">FIRE</Badge>
          </h2>
          <div className="space-y-4">
            {firePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Trending posts */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending This Week
        </h2>
        <div className="space-y-4">
          {trendingPosts.length > 0 ? (
            trendingPosts.map((post, index) => (
              <div key={post.id} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <PostCard post={post} />
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card rounded-xl p-12 text-center">
              <p className="text-muted-foreground">No trending posts yet. Be the first to share!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
