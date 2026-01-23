'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X, Users, MessageSquare, Activity, Calendar, Sparkles } from 'lucide-react'
import { ComprehensiveImpactCard } from './ComprehensiveImpactCard'
import { cn } from '@/lib/design/utils'
import { getRandomEncouragement, getLevelHype } from '@/lib/design/encouragement'

interface NavItem {
  label: string
  href: string
  subtitle?: string
  icon?: React.ReactNode
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  user: {
    name: string
    avatar: string
    level: number
    title: string
  }
  userXP: number
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: 'sankofa' | 'gyenyame' | 'dwennimmen' | 'fihankra' | 'mpatapo'
    progress: number
    total: number
    unlocked: boolean
  }>
  impactData: {
    percentile: number
    streakDays: number
    totalActions: number
    helpfulComments: number
    nextMilestone: {
      title: string
      target: number
      progress: number
    }
    contributionData: Array<{
      date: string
      count: number
      level: 0 | 1 | 2 | 3
    }>
  }
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  user,
  userXP,
  achievements,
  impactData,
  className = '',
}) => {
  const [encouragement, setEncouragement] = useState(getRandomEncouragement())
  const [levelHype, setLevelHype] = useState(getLevelHype(user.level))
  const [isDesktop, setIsDesktop] = useState(false)

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Refresh encouragement message daily
  useEffect(() => {
    const updateEncouragement = () => {
      setEncouragement(getRandomEncouragement())
      setLevelHype(getLevelHype(user.level))
    }

    // Update every 6 hours
    const interval = setInterval(updateEncouragement, 6 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user.level])

  const primaryNav: NavItem[] = [
    { label: 'Start Your Journey', href: '/journey' },
    { label: 'Join the Hackathon', href: '/hackathon' },
    { label: 'NJOOBA Store', href: '/store' },
    { label: 'My Apps', href: '/apps' },
  ]

  const communityNav: NavItem[] = [
    {
      label: 'Groups',
      href: '/groups',
      subtitle: 'Connect with devs like you.',
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'Discussions',
      href: '/discussions',
      subtitle: 'Ask, share, and help.',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      label: 'Recent Activity',
      href: '/activity',
      subtitle: 'Your progress at a glance.',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      label: 'Events',
      href: '/events',
      subtitle: "What's happening next.",
      icon: <Calendar className="w-4 h-4" />,
    },
  ]

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          // On desktop, always show (x: 0). On mobile, respect isOpen state
          x: isDesktop ? 0 : (isOpen ? 0 : -280),
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          'fixed left-0 top-0 h-screen w-[280px] bg-black border-r border-white/10 z-50',
          'flex flex-col overflow-hidden',
          className
        )}
      >
        {/* Close button (mobile/tablet only) */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 md:hidden z-10"
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-5 h-5 text-white/70" />
        </motion.button>

        {/* Scrollable Content - Everything flows naturally */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-savanna-gold/20 p-4 space-y-4">
          {/* USER PROFILE CARD */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-charcoal-base/60 to-charcoal-base/30 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-savanna-gold/30">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-heading font-bold text-clay-white">
                  {user.name}
                </h3>
                <p className="text-xs text-white/50">
                  Level {user.level} • {user.title}
                </p>
              </div>
            </div>

            {/* Hype/Encouragement Message */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 rounded-lg bg-gradient-to-br from-savanna-gold/10 to-terracotta-primary/10 border border-savanna-gold/20"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-savanna-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-savanna-gold mb-1">
                    {levelHype}
                  </p>
                  <p className="text-xs text-clay-white/80 leading-relaxed italic">
                    "{encouragement.message}"
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">
                    — {encouragement.source}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.button
              className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-terracotta-primary to-savanna-gold text-charcoal-base text-sm font-medium"
              whileTap={{ scale: 0.97 }}
            >
              View Profile
            </motion.button>
          </div>

          {/* PRIMARY NAVIGATION */}
          <nav className="p-4 rounded-xl bg-gradient-to-br from-charcoal-base/40 to-charcoal-base/20 border border-white/10">
            <ul className="space-y-1">
              {primaryNav.map((item, index) => (
                <li key={index}>
                  <motion.a
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-clay-white hover:bg-white/5 transition-colors group"
                    whileTap={{ scale: 0.98 }}
                  >
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-savanna-gold transition-colors" />
                    <span className="group-hover:text-savanna-gold transition-colors">
                      {item.label}
                    </span>
                  </motion.a>
                </li>
              ))}
            </ul>
          </nav>

          {/* COMMUNITY SECTION */}
          <nav className="p-4 rounded-xl bg-gradient-to-br from-charcoal-base/40 to-charcoal-base/20 border border-white/10">
            <h4 className="text-xs font-heading font-bold text-white/40 uppercase tracking-wider mb-3 px-3">
              Community
            </h4>
            <ul className="space-y-1">
              {communityNav.map((item, index) => (
                <li key={index}>
                  <motion.a
                    href={item.href}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {item.icon && (
                        <div className="text-white/40 group-hover:text-savanna-gold transition-colors">
                          {item.icon}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm text-clay-white group-hover:text-savanna-gold transition-colors">
                          {item.label}
                        </div>
                        {item.subtitle && (
                          <div className="text-xs text-white/50 mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.a>
                </li>
              ))}
            </ul>
          </nav>

          {/* YOUR IMPACT - Comprehensive Card */}
          <ComprehensiveImpactCard
            userLevel={user.level}
            userTitle={user.title}
            userXP={userXP}
            percentile={impactData.percentile}
            streakDays={impactData.streakDays}
            totalActions={impactData.totalActions}
            helpfulComments={impactData.helpfulComments}
            achievements={achievements}
            nextMilestone={impactData.nextMilestone}
            contributionData={impactData.contributionData}
          />
        </div>
      </motion.aside>
    </>
  )
}
