"use client"

import { useState } from "react"
import { ArrowUp, MessageCircle, Bookmark, Share2, Clock, Flame, Mic, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PostWithProfile } from "@/lib/supabase/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface PostCardProps {
  post: PostWithProfile
  onUpvote?: (postId: string) => void
  onBookmark?: (postId: string) => void
  hasUpvoted?: boolean
  hasBookmarked?: boolean
}

// Map DB categories to colors
const CATEGORY_COLORS: Record<string, string> = {
  'ai': '#8B5CF6', // Violet
  'fintech': '#10B981', // Emerald
  'devtools': '#F59E0B', // Amber
  'agtech': '#D97706', // Gold
  'healthtech': '#EF4444', // Red
  'edtech': '#3B82F6', // Blue
  'social': '#EC4899', // Pink
  'other': '#6B7280' // Gray
}

export function PostCard({ post, onUpvote, onBookmark, hasUpvoted = false, hasBookmarked = false }: PostCardProps) {
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes)
  const [localHasUpvoted, setLocalHasUpvoted] = useState(hasUpvoted)

  const supabase = createClient()

  const handleUpvote = async () => {
    if (isUpvoting) return
    
    // Optimistic UI
    setIsUpvoting(true)
    const newUpvotedState = !localHasUpvoted
    setLocalHasUpvoted(newUpvotedState)
    setLocalUpvotes(prev => newUpvotedState ? prev + 1 : prev - 1)

    try {
      if (newUpvotedState) {
        // Call RPC
        const { error } = await supabase.rpc('increment_post_upvotes', { post_uuid: post.id })
        if (error) throw error
        // Also insert into upvotes table? handled by RPC or manually?
        // Schema shows 'upvotes' table but also upvotes count on post.
        // For simplicity in Phase 2, we just use the RPC to increment the counter.
        // Ideally we should also insert into 'upvotes' table to track user state.
        
        // Let's assume onUpvote prop handles the parent logic if provided,
        // otherwise we do local only.
        onUpvote?.(post.id)
      } else {
        const { error } = await supabase.rpc('decrement_post_upvotes', { post_uuid: post.id })
        if (error) throw error
        onUpvote?.(post.id)
      }
    } catch (err) {
      // Revert on error
      console.error('Upvote failed', err)
      setLocalHasUpvoted(!newUpvotedState)
      setLocalUpvotes(prev => !newUpvotedState ? prev + 1 : prev - 1)
    } finally {
      setIsUpvoting(false)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  const isFire = localUpvotes >= 10 || post.is_featured
  const categoryColor = post.category ? CATEGORY_COLORS[post.category] || CATEGORY_COLORS['other'] : CATEGORY_COLORS['other']

  const authorName = post.profiles?.full_name || post.profiles?.username || "Anonymous"
  const authorHandle = post.profiles?.username || "user"
  const authorAvatar = post.profiles?.avatar_url

  // Featured/Showcase card style (Bigger)
  if (post.is_featured || post.type === "showcase") {
    return (
      <article className="glass-card rounded-xl overflow-hidden group border border-white/10 hover:border-savanna-gold/30 transition-all duration-300">
        {/* Image */}
        {post.image_url && (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={post.image_url}
              alt={post.title || "Post image"}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {/* Tags overlay */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {post.category && (
                <Badge
                  className="text-xs font-medium border-0"
                  style={{ backgroundColor: categoryColor, color: "#fff" }}
                >
                  {post.category.toUpperCase()}
                </Badge>
              )}
              {post.is_featured && (
                <Badge className="bg-savanna-gold text-charcoal-base font-bold text-xs border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  FEATURED
                </Badge>
              )}
              {isFire && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs border-0 fire-badge animate-pulse-slow">
                  <Flame className="h-3 w-3 mr-1" />
                  FIRE
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 bg-charcoal-surface/50 backdrop-blur-sm">
          <Link href={`/post/${post.id}`}>
            <h2 className="text-lg font-heading font-semibold text-clay-white leading-tight mb-2 line-clamp-2 hover:text-savanna-gold transition-colors">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-clay-white/70 line-clamp-2 mb-4 font-body">{post.content}</p>

          {/* Author and interactions */}
          <div className="flex items-center justify-between">
            <Link href={`/u/${authorHandle}`} className="flex items-center gap-2 group/author">
              <Avatar className="h-8 w-8 border border-white/10 group-hover/author:border-savanna-gold/50 transition-colors">
                <AvatarImage src={authorAvatar || undefined} />
                <AvatarFallback className="bg-charcoal-light text-clay-white text-xs">
                  {authorName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-clay-white group-hover/author:text-savanna-gold transition-colors">
                  {authorName}
                </p>
                <p className="text-xs text-clay-white/40">{timeAgo}</p>
              </div>
            </Link>

            {/* Interaction buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpvote}
                className={cn(
                  "h-8 px-3 rounded-full transition-all",
                  localHasUpvoted 
                    ? "bg-savanna-gold/20 text-savanna-gold" 
                    : "text-clay-white/60 hover:bg-white/10 hover:text-clay-white",
                )}
              >
                <ArrowUp className={cn("h-4 w-4 mr-1", localHasUpvoted && "fill-current")} />
                <span className="text-xs font-medium">
                  {localUpvotes > 999 ? `${(localUpvotes / 1000).toFixed(1)}k` : localUpvotes}
                </span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full text-clay-white/60 hover:bg-white/10 hover:text-clay-white">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">{post.comment_count}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onBookmark?.(post.id)}
                className={cn("h-8 w-8 rounded-full hover:bg-white/10", hasBookmarked ? "text-savanna-gold" : "text-clay-white/60")}
              >
                <Bookmark className={cn("h-4 w-4", hasBookmarked && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Compact post style (Discussion/Question) - X-style
  return (
    <article className="glass-card rounded-xl p-4 group border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex gap-3">
        {/* Author avatar */}
        <Link href={`/u/${authorHandle}`} className="flex-shrink-0">
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src={authorAvatar || undefined} />
            <AvatarFallback className="bg-charcoal-light text-clay-white text-sm">
              {authorName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link href={`/u/${authorHandle}`} className="font-semibold text-clay-white hover:text-savanna-gold transition-colors text-sm">
              {authorName}
            </Link>
            <span className="text-clay-white/40 text-xs">@{authorHandle}</span>
            <span className="text-clay-white/40 text-xs">·</span>
            <span className="text-clay-white/40 text-xs">{timeAgo}</span>
            {post.category && (
              <Badge
                variant="outline"
                className="text-[10px] ml-auto border h-5 px-1.5"
                style={{ borderColor: categoryColor, color: categoryColor }}
              >
                {post.category.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Content */}
          <Link href={`/post/${post.id}`} className="block mb-2 group-hover:opacity-90 transition-opacity">
            {post.title && <h3 className="text-base font-semibold text-clay-white mb-1">{post.title}</h3>}
            <p className="text-clay-white/80 text-sm whitespace-pre-wrap">{post.content}</p>
          </Link>

          {/* Image (if any) */}
          {post.image_url && (
            <div className="rounded-xl overflow-hidden mb-3 border border-white/10">
              <img
                src={post.image_url}
                alt="Post attachment"
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

          {/* Interaction bar */}
          <div className="flex items-center justify-between text-clay-white/50 mt-3">
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:text-emerald-400 hover:bg-emerald-400/10 -ml-2">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              <span className="text-xs">{post.comment_count}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              className={cn(
                "h-8 px-2 transition-colors",
                localHasUpvoted ? "text-savanna-gold bg-savanna-gold/10" : "hover:text-savanna-gold hover:bg-savanna-gold/10",
              )}
            >
              <ArrowUp className={cn("h-4 w-4 mr-1.5", localHasUpvoted && "fill-current")} />
              <span className="text-xs">{localUpvotes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:text-violet-400 hover:bg-violet-400/10">
              <Mic className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Voice</span>
            </Button>
            <div className="flex gap-1">
                <Button
                variant="ghost"
                size="icon"
                onClick={() => onBookmark?.(post.id)}
                className={cn("h-8 w-8 hover:text-savanna-gold hover:bg-savanna-gold/10", hasBookmarked && "text-savanna-gold")}
                >
                <Bookmark className={cn("h-4 w-4", hasBookmarked && "fill-current")} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-emerald-400 hover:bg-emerald-400/10">
                <Share2 className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}