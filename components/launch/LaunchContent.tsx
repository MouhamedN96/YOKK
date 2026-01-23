"use client"

import { useState } from "react"
import { Rocket, Star, Clock, TrendingUp, Plus, ArrowUp, MessageCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Profile } from "@/lib/types"
import type { DemoProduct } from "@/lib/types"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LaunchContentProps {
  profile: Profile | null
  featuredProducts: DemoProduct[]
  recentProducts: DemoProduct[]
  topProducts: DemoProduct[]
}

export function LaunchContent({ profile, featuredProducts, recentProducts, topProducts }: LaunchContentProps) {
  const [activeTab, setActiveTab] = useState("recent")
  const [votes, setVotes] = useState<Record<string, boolean>>({})

  const handleVote = (productId: string) => {
    setVotes((prev) => ({ ...prev, [productId]: !prev[productId] }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Product Launch
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Discover and launch African tech products</p>
        </div>
        {profile && (
          <Link href="/launch/submit">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Submit Product
            </Button>
          </Link>
        )}
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary fill-primary" />
            Featured Launches
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredProducts.map((product) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                voted={votes[product.id]}
                onVote={() => handleVote(product.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 p-1 rounded-xl mb-6">
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </TabsTrigger>
          <TabsTrigger
            value="top"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Top Voted
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-3">
          {recentProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              voted={votes[product.id]}
              onVote={() => handleVote(product.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="top" className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={product.id} className="flex gap-3 items-start">
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  index === 0 && "bg-primary/20 text-primary yokk-glow-sm",
                  index === 1 && "bg-accent/20 text-accent",
                  index === 2 && "bg-orange-500/20 text-orange-400",
                  index > 2 && "bg-secondary text-muted-foreground",
                )}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <ProductCard product={product} voted={votes[product.id]} onVote={() => handleVote(product.id)} />
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FeaturedProductCard({
  product,
  voted,
  onVote,
}: {
  product: DemoProduct
  voted?: boolean
  onVote: () => void
}) {
  const voteCount = voted ? product.upvotes + 1 : product.upvotes

  return (
    <div className="glass-card rounded-xl overflow-hidden group">
      <div className="p-4">
        <div className="flex gap-3">
          <img
            src={product.logo_url || "/placeholder.svg"}
            alt={product.name}
            className="w-14 h-14 rounded-xl object-cover border border-border/50"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{product.tagline}</p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] flex-shrink-0"
                style={{ borderColor: product.category.color, color: product.category.color }}
              >
                {product.category.name}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={product.maker.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-secondary">{product.maker.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{product.maker.full_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4 mr-1" />
              {product.comment_count}
            </Button>
            <Button
              size="sm"
              onClick={onVote}
              className={cn(
                "h-8 px-3 rounded-full",
                voted ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-primary/20 text-foreground",
              )}
            >
              <ArrowUp className={cn("h-4 w-4 mr-1", voted && "fill-current")} />
              {voteCount}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({
  product,
  voted,
  onVote,
}: {
  product: DemoProduct
  voted?: boolean
  onVote: () => void
}) {
  const voteCount = voted ? product.upvotes + 1 : product.upvotes

  return (
    <div className="glass-card rounded-xl p-4 flex gap-4 group">
      <img
        src={product.logo_url || "/placeholder.svg"}
        alt={product.name}
        className="w-12 h-12 rounded-xl object-cover border border-border/50 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{product.tagline}</p>
          </div>
          <Button
            size="sm"
            onClick={onVote}
            className={cn(
              "h-9 px-3 rounded-full flex-shrink-0",
              voted ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-primary/20 text-foreground",
            )}
          >
            <ArrowUp className={cn("h-4 w-4 mr-1", voted && "fill-current")} />
            {voteCount}
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{ borderColor: product.category.color, color: product.category.color }}
          >
            {product.category.name}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {product.comment_count}
          </span>
          <a
            href={product.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Visit
          </a>
        </div>
      </div>
    </div>
  )
}
