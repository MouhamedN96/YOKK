'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Flame,
  Zap,
  MessageCircle,
  Share2,
  Copy,
  Check,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import { ContributionGrid } from './ContributionGrid'
import { LevelBadge } from '@/components/design/gamification/LevelBadge'
import { StreakDisplay } from '@/components/design/gamification/StreakDisplay'
import { AchievementBadge } from '@/components/design/gamification/AchievementBadge'
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

interface ComprehensiveImpactCardProps {
  // User data
  userLevel: number
  userTitle: string
  userXP: number

  // Impact stats
  percentile: number
  streakDays: number
  totalActions: number
  helpfulComments: number

  // Achievements
  achievements: Achievement[]

  // Milestone
  nextMilestone: {
    title: string
    target: number
    progress: number
  }

  // Contribution data
  contributionData: Array<{
    date: string
    count: number
    level: 0 | 1 | 2 | 3
  }>

  className?: string
}

export const ComprehensiveImpactCard: React.FC<ComprehensiveImpactCardProps> = ({
  userLevel,
  userTitle,
  userXP,
  percentile,
  streakDays,
  totalActions,
  helpfulComments,
  achievements,
  nextMilestone,
  contributionData,
  className = '',
}) => {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  // Load expansion state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('njooba-impact-expanded')
    if (saved !== null) {
      setIsExpanded(JSON.parse(saved))
    }
  }, [])

  // Save expansion state to localStorage
  const toggleExpanded = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    localStorage.setItem('njooba-impact-expanded', JSON.stringify(newState))
  }

  const progressPercentage = Math.round((nextMilestone.progress / nextMilestone.target) * 100)

  const handleShare = (platform: 'twitter' | 'linkedin' | 'whatsapp' | 'copy') => {
    const stats = `🔥 ${streakDays}-day streak | ⚡ ${totalActions} actions | 💬 ${helpfulComments} helps`
    const shareUrl = `https://njooba.dev/profile/share?stats=${encodeURIComponent(stats)}`

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Check out my NJOOBA journey! ${stats}\n\nJoin me at:`
          )}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        )
        break
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        )
        break
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `Check out my NJOOBA journey: ${stats}\n${shareUrl}`
          )}`,
          '_blank'
        )
        break
      case 'copy':
        navigator.clipboard.writeText(`${stats}\n${shareUrl}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toggle Header */}
      <motion.button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-charcoal-base/60 to-charcoal-base/30 border border-savanna-gold/20 hover:border-savanna-gold/40 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-savanna-gold" />
          <h3 className="text-sm font-heading font-bold text-clay-white">
            YOUR IMPACT 🔥
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-savanna-gold" />
        </motion.div>
      </motion.button>

      {/* Collapsible Content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-4">
            {/* Level Badge */}
            <LevelBadge xp={userXP} showProgress />

            {/* Streak Display */}
            <StreakDisplay days={streakDays} />

            {/* Achievements */}
            <motion.div
              className="card-base p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-heading font-bold text-clay-white mb-3">
                Recent Achievements
              </h3>
              <div className="flex gap-2 flex-wrap">
                {achievements.slice(0, 3).map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="sm"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Impact Stats Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-charcoal-base/80 to-charcoal-base/40 border border-savanna-gold/20 backdrop-blur-sm"
          >
            {/* Percentile Badge */}
            <div className="mb-4">
              <p className="text-xs text-savanna-gold font-medium">
                TOP {percentile}% • Level {userLevel} {userTitle}
              </p>
            </div>

            {/* Contribution Grid */}
            <div className="mb-4">
              <ContributionGrid data={contributionData} />
              <p className="text-[10px] text-white/30 mt-2">Last 8 weeks</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-4 h-4 text-savanna-gold" />
                  <span className="text-lg font-bold text-clay-white">{streakDays}</span>
                </div>
                <p className="text-[10px] text-white/50">days</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-savanna-gold" />
                  <span className="text-lg font-bold text-clay-white">{totalActions}</span>
                </div>
                <p className="text-[10px] text-white/50">acts</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageCircle className="w-4 h-4 text-savanna-gold" />
                  <span className="text-lg font-bold text-clay-white">{helpfulComments}</span>
                </div>
                <p className="text-[10px] text-white/50">helps</p>
              </div>
            </div>

            {/* Next Milestone */}
            <div className="mb-4">
              <p className="text-xs text-white/70 mb-2">Next milestone:</p>
              <p className="text-sm font-medium text-clay-white mb-2">{nextMilestone.title}</p>

              {/* Progress Bar */}
              <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-savanna-gold to-terracotta-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-savanna-gold mt-1">{progressPercentage}% complete</p>
            </div>

            {/* Share Section */}
            <div>
              <p className="text-xs text-white/70 mb-2">Share Your Journey:</p>
              <div className="flex gap-2">
                {/* Twitter/X */}
                <motion.button
                  onClick={() => handleShare('twitter')}
                  className="flex-1 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 text-white/70 hover:text-savanna-gold transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </motion.button>

                {/* LinkedIn */}
                <motion.button
                  onClick={() => handleShare('linkedin')}
                  className="flex-1 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 text-white/70 hover:text-savanna-gold transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </motion.button>

                {/* WhatsApp */}
                <motion.button
                  onClick={() => handleShare('whatsapp')}
                  className="flex-1 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 text-white/70 hover:text-savanna-gold transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </motion.button>

                {/* Copy Link */}
                <motion.button
                  onClick={() => handleShare('copy')}
                  className="flex-1 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-savanna-gold" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/70 hover:text-savanna-gold transition-colors" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
