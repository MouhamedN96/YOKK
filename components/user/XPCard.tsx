"use client"

import { Building2, Star, Lock } from "lucide-react"
import { calculateLevel, getLevelTitle } from "@/lib/types"
import { cn } from "@/lib/utils"

interface XPCardProps {
  xp: number
  className?: string
}

export function XPCard({ xp, className }: XPCardProps) {
  const { level, progress, xpForNextLevel } = calculateLevel(xp)
  const title = getLevelTitle(level)
  const xpToNext = Math.ceil(xpForNextLevel - (progress / 100) * xpForNextLevel)

  return (
    <div className={cn("glass-card rounded-xl p-4", className)}>
      {/* Level badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">Level {level}</span>
            <span className="text-sm text-primary font-medium">{title}</span>
          </div>
          <p className="text-sm text-muted-foreground">{xp.toLocaleString()} XP</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full xp-bar-fill transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{Math.round(progress)}% to next level</span>
        <span className="text-primary">+{xpToNext} XP</span>
      </div>
    </div>
  )
}

interface JourneyCardProps {
  day: number
  streak: number
  milestone: string
  className?: string
}

export function JourneyCard({ day, streak, milestone, className }: JourneyCardProps) {
  const progressPercent = (day / 23) * 100

  return (
    <div className={cn("glass-card rounded-xl p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
          <span className="text-accent">&#128293;</span>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{day}-Day Journey</h3>
          <p className="text-xs text-accent">Harvest &#127806;</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <p className="text-xs text-accent mb-1">&#128293; The fire burns brighter together!</p>
      <p className="text-xs text-muted-foreground">Next milestone: {milestone}</p>
    </div>
  )
}

interface AchievementsPreviewProps {
  achievements: Array<{
    id: string
    name: string
    icon: string
    unlocked: boolean
  }>
  className?: string
}

export function AchievementsPreview({ achievements, className }: AchievementsPreviewProps) {
  return (
    <div className={cn("glass-card rounded-xl p-4", className)}>
      <h3 className="font-semibold text-foreground mb-3">Recent Achievements</h3>
      <div className="flex gap-3">
        {achievements.slice(0, 3).map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all",
              achievement.unlocked ? "border-primary bg-primary/10 yokk-glow-sm" : "border-border/50 bg-secondary/50",
            )}
          >
            {achievement.unlocked ? (
              <Star className="h-6 w-6 text-primary fill-primary" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
