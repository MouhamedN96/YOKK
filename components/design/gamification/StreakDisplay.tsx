'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FlameIcon } from '@/components/design/icons/AdinkraIcons'
import { getStreakMilestone, getUbuntuMessage, cn } from '@/lib/design/utils'

interface StreakDisplayProps {
  days: number
  className?: string
  compact?: boolean
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  days,
  className = '',
  compact = false,
}) => {
  const milestone = getStreakMilestone(days)
  const message = getUbuntuMessage('streak')

  if (compact) {
    return (
      <motion.div
        className={cn('flex items-center gap-1', className)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FlameIcon className="text-terracotta-primary" size={16} />
        <span className="text-caption font-medium text-clay-white">{days}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(
        'card-interactive p-4 bg-gradient-to-br from-terracotta-primary/10 to-savanna-gold/10',
        'border-terracotta-primary/20',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <FlameIcon className="text-terracotta-primary" size={24} />
          </motion.div>
          <div>
            <h3 className="text-h3 text-clay-white">{days}-Day Journey</h3>
            <p className="text-micro text-sand-neutral">{milestone.title} {milestone.emoji}</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-indigo-deep/40 rounded-full overflow-hidden mb-2">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-terracotta-primary to-savanna-gold"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((days / 365) * 100, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Message */}
      <p className="text-caption text-terracotta-primary font-medium">{message}</p>

      {/* Next milestone */}
      {days < 365 && (
        <p className="text-micro text-sand-neutral/70 mt-2">
          Next milestone: {getStreakMilestone(days + 1 >= 365 ? 365 : days < 100 ? 100 : days < 30 ? 30 : days < 14 ? 14 : 7).title}
        </p>
      )}
    </motion.div>
  )
}
