"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VoicePlayerProps {
  src: string
  duration?: number
  className?: string
}

export function VoicePlayer({ src, duration = 0, className }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100)
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={cn("flex items-center gap-2 px-3 py-2 rounded-full bg-accent/10 border border-accent/20", className)}
    >
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="h-8 w-8 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </Button>

      {/* Progress bar */}
      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden min-w-[60px]">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <span className="text-xs text-muted-foreground min-w-[35px]">
        {formatTime(isPlaying ? currentTime : duration)}
      </span>
    </div>
  )
}
