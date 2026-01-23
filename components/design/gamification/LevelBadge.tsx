'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { getLevelFromXP, getLevelProgress, getXPForNextLevel, cn } from '@/lib/design/utils'

interface LevelBadgeProps {
  xp: number
  className?: string
  showProgress?: boolean
  compact?: boolean
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  xp,
  className = '',
  showProgress = true,
  compact = false,
}) => {
  const level = getLevelFromXP(xp)
  const progress = getLevelProgress(xp)
  const xpNeeded = getXPForNextLevel(xp)

  if (compact) {
    return (
      <motion.div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-gradient-to-r from-terracotta-primary/20 to-savanna-gold/20',
          'border border-terracotta-primary/30',
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-h3">{level.emoji}</span>
        <div className="flex flex-col">
          <span className="text-caption font-semibold text-clay-white leading-none">
            Lvl {Math.floor(xp / 100)}
          </span>
          <span className="text-micro text-sand-neutral leading-none">{level.title}</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(
        'card-interactive p-4',
        'bg-gradient-to-br from-indigo-deep/60 to-forest-green/40',
        'border-savanna-gold/20',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Level Info */}
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className="text-5xl"
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {level.emoji}
        </motion.div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-h2 text-clay-white font-bold">Level {Math.floor(xp / 100)}</h3>
            <span className="text-caption text-savanna-gold">{level.title}</span>
          </div>
          <p className="text-body text-sand-neutral">{xp.toLocaleString()} XP</p>
        </div>
      </div>

      {/* Progress to next level */}
      {showProgress && (
        <>
          <div className="relative h-3 bg-charcoal-base/40 rounded-full overflow-hidden mb-2">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${level.color} 0%, ${level.color}dd 100%)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-caption text-sand-neutral">
              {progress.toFixed(0)}% to {level.title === 'Griot' ? 'max level' : 'next level'}
            </span>
            <span className="text-caption text-terracotta-primary font-semibold">
              {xpNeeded > 0 ? `+${xpNeeded} XP` : 'MAX'}
            </span>
          </div>
        </>
      )}
    </motion.div>
  )
}
