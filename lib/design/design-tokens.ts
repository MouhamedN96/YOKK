/**
 * NJOOBA Design Tokens
 * Based on "Sunset Over Dakar" design system
 */

export const colors = {
  // Primary Palette
  terracotta: {
    primary: '#E07856',
    semantic: 'warmth_energy_cta',
  },
  indigo: {
    deep: '#2D3561',
    semantic: 'depth_trust_sophistication',
  },
  savanna: {
    gold: '#F2A541',
    semantic: 'value_premium_celebration',
  },
  forest: {
    green: '#1B4D3E',
    semantic: 'growth_life_progress',
  },
  // Supporting Palette
  sand: {
    neutral: '#E8D7C3',
  },
  charcoal: {
    base: '#1F1F1F',
  },
  clay: {
    white: '#FAF8F5',
  },
  rust: {
    accent: '#B8563E',
  },
} as const

export const typography = {
  families: {
    heading: 'Space Grotesk, system-ui, -apple-system, sans-serif',
    body: 'DM Sans, Plus Jakarta Sans, system-ui, sans-serif',
    display: 'Syne, General Sans, Space Grotesk, system-ui',
  },
  scale: {
    h1: { size: '28px', weight: 700, lineHeight: '120%', letterSpacing: '-1%' },
    h2: { size: '20px', weight: 600, lineHeight: '130%', letterSpacing: '-0.5%' },
    h3: { size: '16px', weight: 600, lineHeight: '140%', letterSpacing: '0%' },
    body: { size: '15px', weight: 400, lineHeight: '150%', letterSpacing: '0%' },
    caption: { size: '13px', weight: 500, lineHeight: '140%', letterSpacing: '0%' },
    micro: { size: '11px', weight: 600, lineHeight: '130%', letterSpacing: '0.5%' },
  },
} as const

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  diagonalCut: '12px 12px 12px 0px',
} as const

export const shadows = {
  sm: '0 2px 4px rgba(224, 120, 86, 0.08)',
  md: '0 4px 12px rgba(224, 120, 86, 0.12)',
  lg: '0 8px 24px rgba(224, 120, 86, 0.16)',
  glow: '0 0 16px rgba(242, 165, 65, 0.24)',
} as const

export const animations = {
  durations: {
    instant: '100ms',
    quick: '200ms',
    normal: '300ms',
    slow: '500ms',
    deliberate: '800ms',
  },
  easings: {
    elasticOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    warmEase: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounceEase: 'cubic-bezier(0.68, 0.0, 0.32, 1.5)',
  },
} as const

// Adinkra Symbol Meanings
export const adinkraSymbols = {
  sankofa: {
    name: 'Sankofa',
    meaning: 'Learn from the past',
    usage: 'saved_content',
    symbol: '⟲',
  },
  gyeNyame: {
    name: 'Gye Nyame',
    meaning: 'Supremacy of God / Community',
    usage: 'community',
    symbol: '✧',
  },
  dwennimmen: {
    name: 'Dwennimmen',
    meaning: 'Strength & Humility',
    usage: 'achievements',
    symbol: '⚛',
  },
  fihankra: {
    name: 'Fihankra',
    meaning: 'Security & Safety',
    usage: 'verified_accounts',
    symbol: '◈',
  },
  mpatapo: {
    name: 'Mpatapo',
    meaning: 'Reconciliation',
    usage: 'resolved_issues',
    symbol: '⚯',
  },
} as const

// Content Categories
export const categories = {
  agritech: { color: colors.forest.green, label: 'AgriTech' },
  healthtech: { color: colors.rust.accent, label: 'HealthTech' },
  fintech: { color: colors.savanna.gold, label: 'FinTech' },
  aiml: { color: colors.indigo.deep, label: 'AI/ML' },
  edtech: { color: colors.terracotta.primary, label: 'EdTech' },
  cleantech: { color: colors.forest.green, label: 'CleanTech' },
} as const

// Gamification Levels
export const levels = [
  { min: 1, max: 5, title: 'Learner', emoji: '🌱', color: colors.forest.green },
  { min: 6, max: 10, title: 'Builder', emoji: '🔨', color: colors.terracotta.primary },
  { min: 11, max: 20, title: 'Innovator', emoji: '💡', color: colors.savanna.gold },
  { min: 21, max: 35, title: 'Architect', emoji: '🏛️', color: colors.indigo.deep },
  { min: 36, max: 50, title: 'Elder', emoji: '👑', color: colors.savanna.gold },
  { min: 51, max: 9999, title: 'Griot', emoji: '📖', color: colors.terracotta.primary },
] as const

// XP Values
export const xpRewards = {
  readArticle: 5,
  upvote: 2,
  comment: 10,
  postArticle: 25,
  helpfulComment: 50,
  tutorialCompletion: 100,
  answerQuestion: 30,
  solutionAccepted: 150,
  dailyStreak: 20,
  weeklyChallenge: 200,
} as const
