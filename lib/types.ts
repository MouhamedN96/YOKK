// XP levels calculation utilities
// Types are now sourced from @/lib/supabase/types

export function calculateLevel(xp: number): { level: number; progress: number; xpForNextLevel: number } {
  const baseXP = 100
  const multiplier = 1.5

  let level = 1
  let totalXPRequired = baseXP

  while (xp >= totalXPRequired) {
    level++
    totalXPRequired += Math.floor(baseXP * Math.pow(multiplier, level - 1))
  }

  const previousLevelXP = totalXPRequired - Math.floor(baseXP * Math.pow(multiplier, level - 1))
  const xpForNextLevel = totalXPRequired - previousLevelXP
  const currentLevelXP = xp - previousLevelXP
  const progress = (currentLevelXP / xpForNextLevel) * 100

  return { level, progress, xpForNextLevel }
}

export function getLevelTitle(level: number): string {
  if (level < 5) return "Newcomer"
  if (level < 10) return "Explorer"
  if (level < 15) return "Builder"
  if (level < 20) return "Innovator"
  if (level < 25) return "Architect"
  if (level < 30) return "Master"
  return "Legend"
}

// Re-export Supabase types for convenience
export type { Profile, Post, Comment, Launch, PostWithProfile } from "@/lib/supabase/types"

// Category type for demo UI (not in DB schema)
export interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string | null
}

// Achievement display type (simplified from DB)
export interface Achievement {
  id: string
  name: string
  description: string | null
  icon: string | null
  xp_reward: number
  rarity?: "common" | "uncommon" | "rare" | "legendary"
}

// User achievement for demo
export interface UserAchievement {
  achievement_id: string
  unlocked_at: string
}

// Demo product type (for launch page display)
export interface DemoProduct {
  id: string
  name: string
  tagline: string
  description: string
  logo_url: string | null
  website_url: string
  category: Category
  maker: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  upvotes: number
  comment_count: number
  is_featured: boolean
  launched_at: string
}
