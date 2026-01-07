"use client"

import { useState } from "react"
import { ArrowUp, MessageCircle, Bookmark, Share2, Clock, Flame, Mic } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Post } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface PostCardProps {
  post: Post
  onUpvote?: (postId: string) => void
  onBookmark?: (postId: string) => void
  hasUpvoted?: boolean
  hasBookmarked?: boolean
}

export function PostCard({ post, onUpvote, onBookmark, hasUpvoted, hasBookmarked }: PostCardProps) {
  const [isUpvoting, setIsUpvoting] = useState(false)

  const handleUpvote = async () => {
    if (isUpvoting) return
    setIsUpvoting(true)
    onUpvote?.(post.id)
    setIsUpvoting(false)
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  // Featured/Article card style
  if (post.is_featured || post.type === "article") {
    return (
      <article className="glass-card rounded-xl overflow-hidden group">
        {/* Image */}
        {post.image_url && (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={post.image_url || "/placeholder.svg"}
              alt={post.title || "Post image"}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {/* Tags overlay */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {post.categories && (
                <Badge
                  className="text-xs font-medium"
                  style={{ backgroundColor: post.categories.color, color: "#fff" }}
                >
                  {post.categories.name}
                </Badge>
              )}
              {post.is_featured && (
                <Badge className="bg-primary text-primary-foreground text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  FEATURED
                </Badge>
              )}
              {post.is_fire && (
                <Badge className="bg-accent text-accent-foreground text-xs fire-badge">
                  <Flame className="h-3 w-3 mr-1" />
                  FIRE
                </Badge>
              )}
            </div>
            {/* Read time */}
            {post.read_time && (
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {post.read_time} min
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <Link href={`/post/${post.id}`}>
            <h2 className="text-lg font-semibold text-foreground leading-tight mb-2 line-clamp-2 hover:text-primary transition-colors">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.content}</p>

          {/* Author and interactions */}
          <div className="flex items-center justify-between">
            <Link href={`/u/${post.profiles?.username}`} className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={post.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-secondary text-xs">
                  {post.profiles?.display_name?.[0] || post.profiles?.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {post.profiles?.display_name || post.profiles?.username}
                </p>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
              </div>
            </Link>

            {/* Interaction buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpvote}
                className={cn(
                  "h-9 px-3 rounded-full",
                  hasUpvoted ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-secondary",
                )}
              >
                <ArrowUp className={cn("h-4 w-4 mr-1", hasUpvoted && "fill-current")} />
                <span className="text-sm font-medium">
                  {post.upvotes > 999 ? `${(post.upvotes / 1000).toFixed(1)}k` : post.upvotes}
                </span>
              </Button>
              <Button variant="ghost" size="sm" className="h-9 px-3 rounded-full hover:bg-secondary">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{post.comments_count}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onBookmark?.(post.id)}
                className={cn("h-9 w-9 rounded-full", hasBookmarked && "text-primary")}
              >
                <Bookmark className={cn("h-4 w-4", hasBookmarked && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Compact post style (X-style)
  return (
    <article className="glass-card rounded-xl p-4 group">
      <div className="flex gap-3">
        {/* Author avatar */}
        <Link href={`/u/${post.profiles?.username}`}>
          <Avatar className="h-10 w-10 border border-border flex-shrink-0">
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-sm">
              {post.profiles?.display_name?.[0] || post.profiles?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/u/${post.profiles?.username}`} className="font-medium text-foreground hover:text-primary">
              {post.profiles?.display_name || post.profiles?.username}
            </Link>
            <span className="text-muted-foreground">@{post.profiles?.username}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{timeAgo}</span>
            {post.categories && (
              <Badge
                variant="outline"
                className="text-[10px] ml-auto"
                style={{ borderColor: post.categories.color, color: post.categories.color }}
              >
                {post.categories.name}
              </Badge>
            )}
          </div>

          {/* Content */}
          <Link href={`/post/${post.id}`}>
            <p className="text-foreground mb-3 whitespace-pre-wrap">{post.content}</p>
          </Link>

          {/* Image */}
          {post.image_url && (
            <div className="rounded-xl overflow-hidden mb-3 border border-border/50">
              <img
                src={post.image_url || "/placeholder.svg"}
                alt="Post attachment"
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

          {/* Interaction bar */}
          <div className="flex items-center justify-between text-muted-foreground">
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:text-primary hover:bg-primary/10">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              <span className="text-xs">{post.comments_count}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              className={cn(
                "h-8 px-2",
                hasUpvoted ? "text-primary bg-primary/10" : "hover:text-primary hover:bg-primary/10",
              )}
            >
              <ArrowUp className={cn("h-4 w-4 mr-1.5", hasUpvoted && "fill-current")} />
              <span className="text-xs">{post.upvotes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:text-accent hover:bg-accent/10">
              <Mic className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Voice</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onBookmark?.(post.id)}
              className={cn("h-8 w-8", hasBookmarked && "text-primary")}
            >
              <Bookmark className={cn("h-4 w-4", hasBookmarked && "fill-current")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    </svg>
  )
}
