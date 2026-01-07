export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  level: number
  xp: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string | null
}

export interface Post {
  id: string
  user_id: string
  category_id: string | null
  type: "post" | "article" | "product" | "video"
  title: string | null
  content: string
  image_url: string | null
  video_url: string | null
  read_time: number | null
  is_featured: boolean
  is_fire: boolean
  upvotes: number
  comments_count: number
  created_at: string
  updated_at: string
  // Joined data
  profiles?: Profile
  categories?: Category
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  voice_url: string | null
  voice_duration: number | null
  created_at: string
  profiles?: Profile
}

export interface Vote {
  id: string
  post_id: string
  user_id: string
  value: number
  created_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string | null
  icon: string | null
  xp_reward: number
  rarity?: "common" | "uncommon" | "rare" | "legendary"
}

export interface UserAchievement {
  id?: string
  user_id?: string
  achievement_id: string
  unlocked_at: string
  achievements?: Achievement
}

export interface DemoProduct {
  id: string
  name: string
  tagline: string
  description: string
  logo_url: string | null
  website_url: string
  category: Category
  maker: Profile
  upvotes: number
  comments_count: number
  is_featured: boolean
  launched_at: string
}

// XP levels calculation
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
