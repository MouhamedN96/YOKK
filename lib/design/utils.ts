import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { levels, xpRewards } from './design-tokens'

/**
 * Utility for merging Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get user level from XP
 */
export function getLevelFromXP(xp: number): typeof levels[number] {
  for (const level of levels) {
    if (xp >= level.min * 100 && xp < (level.max + 1) * 100) {
      return level
    }
  }
  return levels[levels.length - 1]
}

/**
 * Calculate XP needed for next level
 */
export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP)
  const nextLevelXP = (currentLevel.max + 1) * 100
  return nextLevelXP - currentXP
}

/**
 * Calculate progress percentage to next level
 */
export function getLevelProgress(xp: number): number {
  const currentLevel = getLevelFromXP(xp)
  const levelStart = currentLevel.min * 100
  const levelEnd = (currentLevel.max + 1) * 100
  const progress = ((xp - levelStart) / (levelEnd - levelStart)) * 100
  return Math.min(Math.max(progress, 0), 100)
}

/**
 * Format time ago (e.g., "2h ago", "3d ago")
 */
export function timeAgo(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
    { label: 's', seconds: 1 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count}${interval.label} ago`
    }
  }

  return 'just now'
}

/**
 * Format number with k/m suffix (e.g., 1.2k, 3.5m)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toString()
}

/**
 * Get streak milestone info
 */
export function getStreakMilestone(days: number): {
  title: string
  emoji: string
  description: string
} {
  if (days >= 365) return { title: 'Sankofa Master', emoji: '⚡', description: 'Learn & teach continuously' }
  if (days >= 100) return { title: 'Eternal Flame', emoji: '🔥', description: 'Community pillar' }
  if (days >= 30) return { title: 'Baobab', emoji: '🌳', description: 'Strong foundation' }
  if (days >= 14) return { title: 'Harvest', emoji: '🌾', description: 'Reaping knowledge' }
  if (days >= 7) return { title: 'Sprout', emoji: '🌿', description: 'Growth is showing' }
  if (days >= 3) return { title: 'Seed', emoji: '🌱', description: 'Beginning your journey' }
  return { title: 'Starting', emoji: '✨', description: 'Every journey begins with a single step' }
}

/**
 * Get random Ubuntu proverb/encouragement
 */
export function getUbuntuMessage(type: 'streak' | 'levelup' | 'achievement' | 'welcome'): string {
  const messages = {
    streak: [
      '🔥 The fire burns brighter together!',
      '🌍 Ubuntu: Your growth lifts the community',
      '🌱 Small daily drops make the mighty ocean',
      '⚡ You\'re on fire! Keep the momentum!',
    ],
    levelup: [
      '👑 From seed to Baobab - your journey inspires!',
      '🎯 You\'ve evolved! The community sees your growth',
      '💪 Dwennimmen - Strength through consistency',
    ],
    achievement: [
      '📖 Sankofa: You honor the past by learning',
      '🤝 Mpatapo: You weave the community together',
      '🌟 The stars shine brightest in unity',
    ],
    welcome: [
      '🌅 Welcome back! The community missed you',
      '🌱 Every Baobab started as a seed. Begin again!',
      '🔥 Reignite your flame - we\'re here with you',
    ],
  }

  const messageList = messages[type]
  return messageList[Math.floor(Math.random() * messageList.length)]
}
