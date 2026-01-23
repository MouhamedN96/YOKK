"use client"

import { useState } from "react"
import { CategoryChips } from "@/components/feed/CategoryChips"
import { PostCard } from "@/components/feed/PostCard"
import { XPCard, JourneyCard, AchievementsPreview } from "@/components/user/XPCard"
import { createClient } from "@/lib/supabase/client"
import type { PostWithProfile, Profile } from "@/lib/supabase/types"

// Simple category type for feed display (matches CategoryChips internal type)
interface FeedCategory {
  id: string
  name: string
  color: string
}

interface FeedContentProps {
  profile: Profile | null
  posts: PostWithProfile[]
}

// Hardcoded for now as they aren't in DB yet
const DEMO_CATEGORIES: FeedCategory[] = [
  { id: 'ai', name: 'AI & ML', color: '#8B5CF6' },
  { id: 'fintech', name: 'FinTech', color: '#10B981' },
  { id: 'devtools', name: 'DevTools', color: '#F59E0B' },
  { id: 'agtech', name: 'AgTech', color: '#D97706' },
]

export function FeedContent({ profile, posts }: FeedContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [localPosts, setLocalPosts] = useState(posts)
  // In a real app, we'd fetch user's initial votes too.
  // For Phase 2, we default to empty map for interactions unless passed.
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})
  const [userBookmarks, setUserBookmarks] = useState<Set<string>>(new Set())

  const supabase = createClient()

  const featuredPosts = localPosts.filter(p => p.is_featured || p.upvotes > 20)
  const regularPosts = localPosts.filter(p => !p.is_featured)

  const filteredPosts = selectedCategory 
    ? localPosts.filter((p) => p.category === selectedCategory) 
    : localPosts

  const handleUpvote = async (postId: string) => {
    // Logic handled inside PostCard mostly for UI, 
    // but if we want to update local state here:
    // This is duplicate logic. Ideally PostCard manages its own optimistic state
    // OR we lift it up. PostCard has it now.
    // We can just keep this empty or use it to refresh data.
    console.log('Upvoted', postId)
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

    if (!profile) return

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
          <div className="mb-4">
            <CategoryChips categories={DEMO_CATEGORIES} selected={selectedCategory} onSelect={setSelectedCategory} />
          </div>

          {/* Featured posts */}
          {featuredPosts.length > 0 && !selectedCategory && (
            <div className="mb-6">
              <h2 className="text-lg font-heading font-semibold text-clay-white mb-3 flex items-center gap-2">
                <span className="text-xl">🔥</span> Trending in Africa
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {featuredPosts.slice(0, 4).map((post) => (
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
            <h2 className="text-lg font-heading font-semibold text-clay-white">Latest Discussions</h2>
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

            {filteredPosts.length === 0 && (
              <div className="text-center py-12 glass-card rounded-xl border border-white/10">
                <p className="text-clay-white/60">No posts yet. Be the first to launch!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden xl:block w-80 flex-shrink-0 space-y-4">
          <XPCard xp={profile?.xp || 0} />
          <JourneyCard day={profile?.streak_days || 1} streak={profile?.streak_days || 0} milestone="Newcomer" />
          <AchievementsPreview achievements={mockAchievements} />
        </div>
      </div>
    </div>
  )
}