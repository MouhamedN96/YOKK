/**
 * @njooba/design components - Standalone version for yokk-app
 * Based on "Sunset Over Dakar" design system
 */

// Cards
export { ModernHeroCard } from './cards/ModernHeroCard'
export type { ModernHeroCardData } from './cards/ModernHeroCard'
export { MobileOptimizedCard } from './cards/MobileOptimizedCard'
export type { MobileOptimizedCardData } from './cards/MobileOptimizedCard'

// Gamification
export { StreakDisplay } from './gamification/StreakDisplay'
export { LevelBadge } from './gamification/LevelBadge'
export { AchievementBadge } from './gamification/AchievementBadge'

// Sidebar
export { Sidebar } from './sidebar/Sidebar'
export { ComprehensiveImpactCard } from './sidebar/ComprehensiveImpactCard'
export { ContributionGrid } from './sidebar/ContributionGrid'

// Header
export { CreatePostMenu } from './header/CreatePostMenu'

// Theme
export { ThemeToggle } from './theme/ThemeToggle'

// Icons
export {
  SankofahIcon,
  GyeNyameIcon,
  DwennimmenIcon,
  FihankraIcon,
  MpatapoIcon,
  FlameIcon,
} from './icons/AdinkraIcons'

// Design utilities (re-export from lib)
export {
  cn,
  getLevelFromXP,
  getXPForNextLevel,
  getLevelProgress,
  timeAgo,
  formatNumber,
  getStreakMilestone,
  getUbuntuMessage,
} from '@/lib/design/utils'

export {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  adinkraSymbols,
  categories,
  levels,
  xpRewards,
} from '@/lib/design/design-tokens'

export {
  encouragementMessages,
  getRandomEncouragement,
  getLevelHype,
  getStreakHype,
} from '@/lib/design/encouragement'
