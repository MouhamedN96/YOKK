"use client"

import type React from "react"

import { Lock, Star, Flame, MessageCircle, Mic, Building2, Pen, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Achievement } from "@/lib/types"
import { format } from "date-fns"

interface AchievementWithStatus extends Achievement {
  unlocked: boolean
  unlockedAt?: string
}

interface AchievementGridProps {
  achievements: AchievementWithStatus[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  pen: Pen,
  "message-circle": MessageCircle,
  mic: Mic,
  building: Building2,
  flame: Flame,
  trophy: Trophy,
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {achievements.map((achievement) => {
        const Icon = iconMap[achievement.icon || "star"] || Star

        return (
          <div
            key={achievement.id}
            className={cn(
              "glass-card rounded-xl p-4 text-center transition-all",
              achievement.unlocked ? "border-primary/30 yokk-glow-sm" : "opacity-60",
            )}
          >
            <div
              className={cn(
                "flex h-16 w-16 mx-auto items-center justify-center rounded-full border-2 mb-3",
                achievement.unlocked ? "border-primary bg-primary/20" : "border-border/50 bg-secondary/50",
              )}
            >
              {achievement.unlocked ? (
                <Icon className="h-8 w-8 text-primary" />
              ) : (
                <Lock className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <h3
              className={cn("font-semibold mb-1", achievement.unlocked ? "text-foreground" : "text-muted-foreground")}
            >
              {achievement.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
            <div className="flex items-center justify-center gap-1 text-xs">
              {achievement.unlocked ? (
                <span className="text-primary">
                  Unlocked {achievement.unlockedAt && format(new Date(achievement.unlockedAt), "MMM d")}
                </span>
              ) : (
                <span className="text-muted-foreground">+{achievement.xp_reward} XP</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
