"use client"

import { useState } from "react"
import { CategoryChips } from "@/components/feed/category-chips"
import { PostCard } from "@/components/feed/post-card"
import { XPCard, JourneyCard, AchievementsPreview } from "@/components/user/xp-card"
import { createClient } from "@/lib/supabase/client"
import type { Post, Profile, Category } from "@/lib/types"

interface FeedContentProps {
  profile: Profile | null
  categories: Category[]
  featuredPosts: Post[]
  posts: Post[]
}

export function FeedContent({ profile, categories, featuredPosts, posts }: FeedContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [localPosts, setLocalPosts] = useState(posts)
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})
  const [userBookmarks, setUserBookmarks] = useState<Set<string>>(new Set())

  const filteredPosts = selectedCategory ? localPosts.filter((p) => p.category_id === selectedCategory) : localPosts

  const handleUpvote = async (postId: string) => {
    const currentVote = userVotes[postId] || 0
    const newVote = currentVote === 1 ? 0 : 1

    // Optimistic update
    setUserVotes((prev) => ({ ...prev, [postId]: newVote }))
    setLocalPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + (newVote - currentVote) } : p)),
    )

    // Only persist if logged in
    if (!profile) return

    const supabase = createClient()
    if (newVote === 0) {
      await supabase.from("votes").delete().match({ post_id: postId, user_id: profile.id })
    } else {
      await supabase.from("votes").upsert({
        post_id: postId,
        user_id: profile.id,
        value: newVote,
      })
    }
  }

  const handleBookmark = async (postId: string) => {
    const isBookmarked = userBookmarks.has(postId)

    // Optimistic update
    setUserBookmarks((prev) => {
      const next = new Set(prev)
      if (isBookmarked) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })

    // Only persist if logged in
    if (!profile) return

    const supabase = createClient()
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().match({ post_id: postId, user_id: profile.id })
    } else {
      await supabase.from("bookmarks").insert({ post_id: postId, user_id: profile.id })
    }
  }

  // Mock achievements for preview
  const mockAchievements = [
    { id: "1", name: "Rising Star", icon: "star", unlocked: true },
    { id: "2", name: "First Post", icon: "pen", unlocked: true },
    { id: "3", name: "Architect", icon: "building", unlocked: false },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex gap-6">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-4">
              <CategoryChips categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>
          )}

          {/* Featured posts */}
          {featuredPosts.length > 0 && !selectedCategory && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Featured</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {featuredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpvote={handleUpvote}
                    onBookmark={handleBookmark}
                    hasUpvoted={userVotes[post.id] === 1}
                    hasBookmarked={userBookmarks.has(post.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Feed */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Latest</h2>
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpvote={handleUpvote}
                onBookmark={handleBookmark}
                hasUpvoted={userVotes[post.id] === 1}
                hasBookmarked={userBookmarks.has(post.id)}
              />
            ))}

            {filteredPosts.length === 0 && selectedCategory && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts in this category yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar - show demo XP card */}
        <div className="hidden xl:block w-80 flex-shrink-0 space-y-4">
          <XPCard xp={profile?.xp || 2340} />
          <JourneyCard day={23} streak={7} milestone="Eternal Flame" />
          <AchievementsPreview achievements={mockAchievements} />
        </div>
      </div>
    </div>
  )
}
