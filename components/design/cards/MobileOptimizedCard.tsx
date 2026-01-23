'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUp, Bookmark, MessageCircle, Share2, Flame } from 'lucide-react'
import { cn, timeAgo, formatNumber } from '@/lib/design/utils'

export interface MobileOptimizedCardData {
  id: string
  title: string
  source: string
  author: string
  authorAvatar: string
  imageUrl: string
  category: string
  upvotes: number
  comments: number
  timePosted: Date
  isBookmarked?: boolean
  isUpvoted?: boolean
  trending?: boolean
}

interface MobileOptimizedCardProps {
  data: MobileOptimizedCardData
  onUpvote?: () => void
  onBookmark?: () => void
  onComment?: () => void
  onShare?: () => void
  onClick?: () => void
  className?: string
}

export const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  data,
  onUpvote,
  onBookmark,
  onComment,
  onShare,
  onClick,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()

  // Vibration feedback for touch devices
  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      }
      navigator.vibrate(patterns[type])
    }
  }

  const handleCardTap = () => {
    hapticFeedback('light')
    onClick?.()
  }

  const handleActionTap = (action: () => void, feedbackType: 'light' | 'medium' | 'heavy' = 'medium') => {
    hapticFeedback(feedbackType)
    action()
  }

  // Simplified animations for reduced motion
  const cardAnimation = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        whileTap: { scale: 0.98 },
      }

  const buttonAnimation = shouldReduceMotion
    ? {}
    : {
        whileTap: { scale: 0.92 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      } as const

  return (
    <motion.article
      {...cardAnimation}
      className={cn('w-full touch-manipulation', className)}
      onClick={handleCardTap}
    >
      {/* Main card - optimized for mobile */}
      <div className="relative rounded-3xl overflow-hidden noise gradient-border glass-premium active:scale-[0.98] transition-transform duration-150">

        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient opacity-40" />

        {/* Image section */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={data.imageUrl}
            alt={data.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />

          {/* Badges - larger for mobile */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            {/* Category */}
            <div className="px-4 py-2.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl">
              <span className="text-sm font-black text-white tracking-widest uppercase">
                {data.category}
              </span>
            </div>

            {/* Trending badge */}
            {data.trending && (
              <motion.div
                {...(shouldReduceMotion ? {} : {
                  initial: { scale: 0, rotate: -180 },
                  animate: { scale: 1, rotate: 0 },
                  transition: { type: 'spring', stiffness: 200 }
                })}
                className={shouldReduceMotion ? '' : 'float'}
              >
                <div className="px-3 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-2xl">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-white" />
                    <span className="text-sm font-black text-white tracking-wider">FIRE</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6 space-y-4">
          {/* Title */}
          <h3 className="text-xl font-black leading-tight line-clamp-2 text-white">
            {data.title}
          </h3>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img
                src={data.authorAvatar}
                alt={data.author}
                className="w-11 h-11 rounded-full ring-2 ring-terracotta-primary/30 shadow-xl"
                loading="lazy"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a] shadow-lg shadow-green-500/50" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{data.author}</p>
              <p className="text-xs text-white/50 truncate">
                {data.source} · {timeAgo(data.timePosted)}
              </p>
            </div>
          </div>

          {/* Actions - LARGE touch targets */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/5">
            {/* Upvote - min 44px */}
            <motion.button
              {...buttonAnimation}
              onClick={(e) => {
                e.stopPropagation()
                handleActionTap(() => onUpvote?.(), 'medium')
              }}
              className={cn(
                'flex items-center gap-2.5 px-5 py-3 min-h-[44px] rounded-2xl font-bold transition-all duration-200 shadow-lg',
                data.isUpvoted
                  ? 'bg-gradient-to-r from-terracotta-primary to-savanna-gold text-white glow-terracotta'
                  : 'bg-white/5 text-white/70 active:bg-white/10 active:text-terracotta-primary'
              )}
            >
              <ArrowUp className={cn('w-5 h-5', data.isUpvoted && 'fill-current')} />
              <span className="text-sm font-bold">{formatNumber(data.upvotes)}</span>
            </motion.button>

            {/* Comments */}
            <motion.button
              {...buttonAnimation}
              onClick={(e) => {
                e.stopPropagation()
                handleActionTap(() => onComment?.(), 'light')
              }}
              className="flex items-center gap-2.5 px-5 py-3 min-h-[44px] rounded-2xl bg-white/5 text-white/70 active:bg-white/10 active:text-savanna-gold font-bold transition-all duration-200 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-bold">{formatNumber(data.comments)}</span>
            </motion.button>

            <div className="flex-1" />

            {/* Bookmark */}
            <motion.button
              {...buttonAnimation}
              onClick={(e) => {
                e.stopPropagation()
                handleActionTap(() => onBookmark?.(), 'heavy')
              }}
              className={cn(
                'p-3 min-h-[44px] min-w-[44px] rounded-2xl font-bold transition-all duration-200 shadow-lg flex items-center justify-center',
                data.isBookmarked
                  ? 'bg-gradient-to-r from-savanna-gold to-terracotta-primary text-white glow-gold'
                  : 'bg-white/5 text-white/70 active:bg-white/10 active:text-savanna-gold'
              )}
            >
              <Bookmark className={cn('w-5 h-5', data.isBookmarked && 'fill-current')} />
            </motion.button>

            {/* Share */}
            <motion.button
              {...buttonAnimation}
              onClick={(e) => {
                e.stopPropagation()
                handleActionTap(() => onShare?.(), 'light')
              }}
              className="p-3 min-h-[44px] min-w-[44px] rounded-2xl bg-white/5 text-white/70 active:bg-white/10 active:text-forest-green font-bold transition-all duration-200 shadow-lg flex items-center justify-center"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Active state glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta-primary/0 to-savanna-gold/0 active:from-terracotta-primary/10 active:to-savanna-gold/10 transition-all duration-200 pointer-events-none rounded-3xl" />
      </div>
    </motion.article>
  )
}
