'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Bookmark, MessageCircle, Sparkles, Clock } from 'lucide-react'
import { cn, timeAgo, formatNumber } from '@/lib/design/utils'

export interface ModernHeroCardData {
  id: string
  title: string
  excerpt: string
  source: string
  author: string
  authorAvatar: string
  imageUrl: string
  category: string
  upvotes: number
  comments: number
  timePosted: Date
  readTime?: number
  featured: boolean
  isBookmarked?: boolean
  isUpvoted?: boolean
}

interface ModernHeroCardProps {
  data: ModernHeroCardData
  onUpvote?: () => void
  onBookmark?: () => void
  onComment?: () => void
  onClick?: () => void
  className?: string
}

export const ModernHeroCard: React.FC<ModernHeroCardProps> = ({
  data,
  onUpvote,
  onBookmark,
  onComment,
  onClick,
  className = '',
}) => {
  return (
    <motion.article
      className={cn('group relative cursor-pointer', className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
    >
      {/* Main card container with glass effect */}
      <div className="relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 transition-all duration-700 hover:border-terracotta-primary/40 hover:shadow-[0_25px_80px_-15px_rgba(224,120,86,0.4)]">

        {/* Animated gradient mesh background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, rgba(224,120,86,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, rgba(242,165,65,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 0% 100%, rgba(224,120,86,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 100% 0%, rgba(242,165,65,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 0% 0%, rgba(224,120,86,0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Hero image with parallax effect */}
        <div className="absolute inset-0">
          <motion.div
            className="w-full h-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          >
            <img
              src={data.imageUrl}
              alt={data.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(224,120,86,0.2),transparent_60%)]" />
        </div>

        {/* Top badges */}
        <div className="absolute top-6 left-6 right-6 flex items-start justify-between z-10">
          {/* Category + Featured badge */}
          <div className="flex items-center gap-2">
            <motion.div
              className="px-4 py-2 rounded-xl bg-black/50 backdrop-blur-xl border border-white/20"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-sm font-bold text-white tracking-wider uppercase">
                {data.category}
              </span>
            </motion.div>

            {data.featured && (
              <motion.div
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-savanna-gold via-terracotta-primary to-savanna-gold bg-size-200 animate-gradient-x backdrop-blur-xl shadow-xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-white" />
                  <span className="text-sm font-black text-white">FEATURED</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Read time */}
          {data.readTime && (
            <motion.div
              className="px-3 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-white/70" />
                <span className="text-sm font-medium text-white/90">{data.readTime} min</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <motion.div
            className="space-y-5"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Title */}
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight drop-shadow-2xl group-hover:drop-shadow-[0_0_30px_rgba(224,120,86,0.5)] transition-all duration-300">
              {data.title}
            </h2>

            {/* Excerpt */}
            <p className="text-lg text-white/80 leading-relaxed line-clamp-2 max-w-3xl font-medium">
              {data.excerpt}
            </p>

            {/* Author & actions row */}
            <div className="flex items-center justify-between gap-4 pt-4">
              {/* Author info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={data.authorAvatar}
                    alt={data.author}
                    className="w-12 h-12 rounded-full border-2 border-white/20 shadow-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-forest-green rounded-full border-2 border-black shadow-lg" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">{data.author}</p>
                  <p className="text-sm text-white/60">
                    {data.source} · {timeAgo(data.timePosted)}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {/* Upvote */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpvote?.()
                  }}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg',
                    data.isUpvoted
                      ? 'bg-gradient-to-r from-terracotta-primary to-savanna-gold text-white shadow-terracotta-primary/50'
                      : 'bg-black/50 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:border-terracotta-primary/50'
                  )}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowUp size={20} className={data.isUpvoted ? 'fill-current' : ''} />
                  <span className="text-base">{formatNumber(data.upvotes)}</span>
                </motion.button>

                {/* Comments */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    onComment?.()
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black/50 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:border-savanna-gold/50 font-bold transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle size={20} />
                  <span className="text-base">{formatNumber(data.comments)}</span>
                </motion.button>

                {/* Bookmark */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    onBookmark?.()
                  }}
                  className={cn(
                    'p-3 rounded-xl font-bold transition-all duration-300 shadow-lg',
                    data.isBookmarked
                      ? 'bg-gradient-to-r from-savanna-gold to-terracotta-primary text-white shadow-savanna-gold/50'
                      : 'bg-black/50 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:border-savanna-gold/50'
                  )}
                  whileHover={{ scale: 1.05, y: -2, rotate: data.isBookmarked ? 0 : -12 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bookmark size={20} className={data.isBookmarked ? 'fill-current' : ''} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none"
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgba(224,120,86,0.2)]" />
        </motion.div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
          animate={{
            background: [
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
              'linear-gradient(90deg, transparent 100%, rgba(255,255,255,0.05) 150%, transparent 200%)',
            ],
            backgroundPosition: ['-100% 0', '200% 0'],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </motion.article>
  )
}
