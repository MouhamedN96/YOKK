"use client"

import { ArrowUp, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Post } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface ProductCardProps {
  product: Post
  variant?: "default" | "featured"
  onUpvote?: (id: string) => void
  hasUpvoted?: boolean
}

export function ProductCard({ product, variant = "default", onUpvote, hasUpvoted }: ProductCardProps) {
  const timeAgo = formatDistanceToNow(new Date(product.created_at), { addSuffix: true })

  if (variant === "featured") {
    return (
      <article className="glass-card rounded-xl overflow-hidden group h-full">
        {/* Product image */}
        <div className="relative aspect-video bg-secondary/50">
          {product.image_url ? (
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.title || "Product"}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl text-muted-foreground">{product.title?.[0] || "P"}</span>
            </div>
          )}
          {product.is_featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
          )}
        </div>

        <div className="p-4">
          <Link href={`/post/${product.id}`}>
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {product.title || "Untitled Product"}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.content}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-border">
                <AvatarImage src={product.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-secondary">
                  {product.profiles?.display_name?.[0] || product.profiles?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {product.profiles?.display_name || product.profiles?.username}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpvote?.(product.id)}
              className={cn(
                "h-8 px-3 rounded-full",
                hasUpvoted ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80",
              )}
            >
              <ArrowUp className={cn("h-4 w-4 mr-1", hasUpvoted && "fill-current")} />
              {product.upvotes}
            </Button>
          </div>
        </div>
      </article>
    )
  }

  // Default variant
  return (
    <article className="glass-card rounded-xl p-4 group">
      <div className="flex gap-4">
        {/* Product icon/image */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-secondary/50 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.title || "Product"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl text-muted-foreground">{product.title?.[0] || "P"}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/post/${product.id}`}>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {product.title || "Untitled Product"}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.content}</p>
            </div>

            {/* Upvote button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpvote?.(product.id)}
              className={cn(
                "flex-shrink-0 h-12 w-12 flex-col rounded-xl",
                hasUpvoted ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80",
              )}
            >
              <ArrowUp className={cn("h-4 w-4", hasUpvoted && "fill-current")} />
              <span className="text-xs font-medium">{product.upvotes}</span>
            </Button>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4 border border-border">
                <AvatarImage src={product.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-[8px] bg-secondary">
                  {product.profiles?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{product.profiles?.display_name || product.profiles?.username}</span>
            </div>
            <span>{timeAgo}</span>
            {product.categories && (
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ borderColor: product.categories.color, color: product.categories.color }}
              >
                {product.categories.name}
              </Badge>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <MessageCircle className="h-3 w-3" />
              {product.comments_count}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
