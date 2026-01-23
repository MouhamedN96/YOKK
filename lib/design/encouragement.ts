/**
 * African proverbs and hype messages for user encouragement
 * Inspired by Ubuntu philosophy and pan-African wisdom
 */

export const encouragementMessages = [
  // Ubuntu Philosophy
  {
    message: "I am because we are 🌍",
    source: "Ubuntu Philosophy",
    type: "ubuntu" as const,
  },
  {
    message: "Your growth uplifts the community",
    source: "Ubuntu",
    type: "ubuntu" as const,
  },

  // African Proverbs
  {
    message: "If you want to go fast, go alone. If you want to go far, go together.",
    source: "African Proverb",
    type: "proverb" as const,
  },
  {
    message: "Smooth seas do not make skillful sailors",
    source: "African Proverb",
    type: "proverb" as const,
  },
  {
    message: "A tree cannot make a forest",
    source: "African Proverb",
    type: "proverb" as const,
  },
  {
    message: "The lion does not turn around when a small dog barks",
    source: "African Proverb",
    type: "proverb" as const,
  },
  {
    message: "However long the night, the dawn will break",
    source: "African Proverb",
    type: "proverb" as const,
  },
  {
    message: "Knowledge is like a garden: if it is not cultivated, it cannot be harvested",
    source: "African Proverb",
    type: "proverb" as const,
  },

  // Hype Messages (Level-based)
  {
    message: "You're building something legendary! 🔥",
    source: "NJOOBA",
    type: "hype" as const,
  },
  {
    message: "Every line of code is a step toward greatness!",
    source: "NJOOBA",
    type: "hype" as const,
  },
  {
    message: "The community sees your fire! 🔥",
    source: "NJOOBA",
    type: "hype" as const,
  },
  {
    message: "Your contributions inspire others to rise!",
    source: "NJOOBA",
    type: "hype" as const,
  },
  {
    message: "Consistency is your superpower! ⚡",
    source: "NJOOBA",
    type: "hype" as const,
  },
  {
    message: "You're not just coding, you're creating history!",
    source: "NJOOBA",
    type: "hype" as const,
  },
  {
    message: "African excellence in every commit! 🌟",
    source: "NJOOBA",
    type: "hype" as const,
  },
  {
    message: "The future is being built by devs like you!",
    source: "NJOOBA",
    type: "hype" as const,
  },

  // Streak-based encouragement
  {
    message: "Keep the fire burning! 🔥",
    source: "Streak Keeper",
    type: "streak" as const,
  },
  {
    message: "Your dedication is unmatched!",
    source: "Streak Keeper",
    type: "streak" as const,
  },
  {
    message: "One more day, one more victory!",
    source: "Streak Keeper",
    type: "streak" as const,
  },
]

/**
 * Get a random encouragement message
 */
export const getRandomEncouragement = (type?: 'ubuntu' | 'proverb' | 'hype' | 'streak') => {
  const filtered = type
    ? encouragementMessages.filter(msg => msg.type === type)
    : encouragementMessages

  return filtered[Math.floor(Math.random() * filtered.length)]
}

/**
 * Get level-specific hype message
 */
export const getLevelHype = (level: number): string => {
  if (level < 5) return "Rising Star 🌟"
  if (level < 10) return "Building Momentum 🚀"
  if (level < 20) return "Crushing It! 💪"
  if (level < 30) return "Legendary Status 👑"
  if (level < 50) return "Architect of Excellence 🏛️"
  return "Griot - Master of Wisdom 📖"
}

/**
 * Get streak-specific hype message
 */
export const getStreakHype = (days: number): string => {
  if (days < 3) return "Just getting started!"
  if (days < 7) return "Building habits! 🔥"
  if (days < 14) return "On fire! Keep going! 🔥🔥"
  if (days < 30) return "Unstoppable! 🔥🔥🔥"
  if (days < 60) return "Legendary dedication! 👑"
  if (days < 100) return "Master of consistency! ⚡"
  return "Eternal flame! You're an inspiration! 🌟🔥"
}
