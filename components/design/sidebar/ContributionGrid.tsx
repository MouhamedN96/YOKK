'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/design/utils'

interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 // 0 = none, 1 = low, 2 = medium, 3 = high
}

interface ContributionGridProps {
  data: ContributionDay[]
  className?: string
}

export const ContributionGrid: React.FC<ContributionGridProps> = ({
  data,
  className = '',
}) => {
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Generate 8 weeks of contribution data (7 days × 8 weeks = 56 cells)
  const weeks = 8
  const daysPerWeek = 7
  const totalDays = weeks * daysPerWeek

  // Fill missing days with zero activity
  const fullData: ContributionDay[] = Array.from({ length: totalDays }, (_, i) => {
    const existingDay = data[i]
    if (existingDay) return existingDay

    const date = new Date()
    date.setDate(date.getDate() - (totalDays - i - 1))
    return {
      date: date.toISOString().split('T')[0],
      count: 0,
      level: 0,
    }
  })

  const getLevelColor = (level: 0 | 1 | 2 | 3) => {
    switch (level) {
      case 0:
        return 'bg-white/5' // None - dark gray
      case 1:
        return 'bg-savanna-gold/30' // Low - dim gold
      case 2:
        return 'bg-savanna-gold/60' // Medium - gold
      case 3:
        return 'bg-savanna-gold' // High - bright gold
      default:
        return 'bg-white/5'
    }
  }

  const handleMouseEnter = (day: ContributionDay, event: React.MouseEvent) => {
    setHoveredDay(day)
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 })
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Organize data into weeks
  const weekData: ContributionDay[][] = []
  for (let i = 0; i < weeks; i++) {
    weekData.push(fullData.slice(i * daysPerWeek, (i + 1) * daysPerWeek))
  }

  return (
    <div className={cn('relative', className)}>
      {/* Day labels */}
      <div className="flex gap-0.5 mb-2 text-[10px] text-white/30">
        <div className="w-[10px]"></div>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="w-[10px] text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Contribution grid */}
      <div className="flex gap-0.5">
        {weekData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-0.5">
            {week.map((day, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                className={cn(
                  'w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-all duration-200',
                  getLevelColor(day.level)
                )}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={(e) => handleMouseEnter(day, e)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed z-50 px-2 py-1 bg-charcoal-base border border-savanna-gold/20 rounded text-xs text-clay-white whitespace-nowrap pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-medium">
            {hoveredDay.count} {hoveredDay.count === 1 ? 'action' : 'actions'}
          </div>
          <div className="text-white/50 text-[10px]">
            {formatDate(hoveredDay.date)}
          </div>
        </motion.div>
      )}
    </div>
  )
}
