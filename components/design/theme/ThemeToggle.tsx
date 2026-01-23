'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/design/utils'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  className = '',
}) => {
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={onToggle}
      className={cn(
        'relative w-16 h-8 rounded-full p-1 transition-colors duration-300',
        isDark
          ? 'bg-gradient-to-r from-indigo-deep to-charcoal-base'
          : 'bg-gradient-to-r from-terracotta-primary to-savanna-gold',
        className
      )}
      whileTap={{ scale: 0.95 }}
    >
      {/* Toggle circle */}
      <motion.div
        className={cn(
          'w-6 h-6 rounded-full shadow-lg flex items-center justify-center',
          isDark ? 'bg-clay-white' : 'bg-charcoal-base'
        )}
        animate={{
          x: isDark ? 32 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-indigo-deep" />
        ) : (
          <Sun className="w-4 h-4 text-savanna-gold" />
        )}
      </motion.div>

      {/* Background label */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className={cn('w-4 h-4 transition-opacity', isDark ? 'opacity-30' : 'opacity-0')} />
        <Moon className={cn('w-4 h-4 transition-opacity', isDark ? 'opacity-0' : 'opacity-30')} />
      </div>
    </motion.button>
  )
}
