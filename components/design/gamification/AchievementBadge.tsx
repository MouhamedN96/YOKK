'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  SankofahIcon,
  GyeNyameIcon,
  DwennimmenIcon,
  FihankraIcon,
  MpatapoIcon,
} from '@/components/design/icons/AdinkraIcons'
import { cn } from '@/lib/design/utils'

interface Achievement {
  id: string
  name: string
  description: string
  icon: 'sankofa' | 'gyenyame' | 'dwennimmen' | 'fihankra' | 'mpatapo'
  progress: number
  total: number
  unlocked: boolean
}

interface AchievementBadgeProps {
  achievement: Achievement
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const iconMap = {
  sankofa: SankofahIcon,
  gyenyame: GyeNyameIcon,
  dwennimmen: DwennimmenIcon,
  fihankra: FihankraIcon,
  mpatapo: MpatapoIcon,
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  className = '',
  size = 'md',
}) => {
  const Icon = iconMap[achievement.icon]
  const progressPercent = (achievement.progress / achievement.total) * 100

  const sizes = {
    sm: { container: 'w-16 h-16', icon: 20 },
    md: { container: 'w-24 h-24', icon: 32 },
    lg: { container: 'w-32 h-32', icon: 48 },
  }

  return (
    <motion.div
      className={cn('relative group cursor-pointer', className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Badge container */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl',
          'border-2 transition-all duration-300',
          sizes[size].container,
          achievement.unlocked
            ? 'bg-gradient-to-br from-savanna-gold/20 to-terracotta-primary/20 border-savanna-gold/50 shadow-glow'
            : 'bg-charcoal-base/40 border-sand-neutral/20 grayscale'
        )}
      >
        {/* Icon */}
        <Icon
          size={sizes[size].icon}
          className={cn(
            'transition-colors duration-300',
            achievement.unlocked ? 'text-savanna-gold' : 'text-sand-neutral/30'
          )}
        />

        {/* Lock overlay for locked achievements */}
        {!achievement.unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal-base/60 rounded-xl">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-sand-neutral/50"
            >
              <path
                d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11M5 11H19C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Progress ring for in-progress achievements */}
        {!achievement.unlocked && achievement.progress > 0 && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-sand-neutral/10"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              className="text-terracotta-primary"
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 45 * (1 - progressPercent / 100),
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
        )}
      </div>

      {/* Tooltip on hover */}
      <motion.div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10"
        initial={{ y: 10 }}
        whileHover={{ y: 0 }}
      >
        <div className="bg-indigo-deep border border-terracotta-primary/30 rounded-lg px-3 py-2 shadow-lg min-w-[200px]">
          <h4 className="text-caption font-semibold text-clay-white mb-1">
            {achievement.name}
          </h4>
          <p className="text-micro text-sand-neutral mb-2">{achievement.description}</p>
          {!achievement.unlocked && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-charcoal-base/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-terracotta-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-micro text-terracotta-primary font-semibold">
                {achievement.progress}/{achievement.total}
              </span>
            </div>
          )}
        </div>
        {/* Tooltip arrow */}
        <div className="w-2 h-2 bg-indigo-deep border-r border-b border-terracotta-primary/30 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
      </motion.div>
    </motion.div>
  )
}
