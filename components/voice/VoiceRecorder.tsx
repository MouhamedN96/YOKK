"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onRecorded?: (blob: Blob, duration: number) => void
  onCancel?: () => void
  maxDuration?: number // in seconds
  className?: string
}

export function VoiceRecorder({ onRecorded, onCancel, maxDuration = 60, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error("Failed to start recording:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playPause = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const reset = () => {
    setAudioBlob(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setDuration(0)
    setIsPlaying(false)
    onCancel?.()
  }

  const submit = () => {
    if (audioBlob) {
      onRecorded?.(audioBlob, duration)
      reset()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}

      {!isRecording && !audioBlob && (
        <Button
          variant="ghost"
          size="icon"
          onClick={startRecording}
          className="h-10 w-10 rounded-full bg-accent/20 text-accent hover:bg-accent/30"
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}

      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-destructive/20">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm font-medium text-destructive">{formatTime(duration)}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={stopRecording}
            className="h-8 w-8 text-destructive hover:bg-destructive/20"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary">
          {/* Waveform visualization placeholder */}
          <div className="flex items-center gap-0.5 h-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary/60 rounded-full"
                style={{
                  height: `${Math.random() * 100}%`,
                  minHeight: "4px",
                }}
              />
            ))}
          </div>

          <span className="text-sm text-muted-foreground ml-2">{formatTime(duration)}</span>

          <Button variant="ghost" size="icon" onClick={playPause} className="h-8 w-8">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={reset} className="h-8 w-8 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={submit} className="h-8 w-8 text-primary">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
