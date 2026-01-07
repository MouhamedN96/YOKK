"use client"

import { useState, useRef } from "react"
import { ArrowUp, MessageCircle, Bookmark, Share2, ArrowLeft, Mic, Square, Play, Pause, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Post, Comment, Profile } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PostDetailProps {
  post: Post
  comments: (Comment & { profiles: Profile })[]
  currentUser: Profile | null
  userVote: number | null
}

export function PostDetail({ post, comments, currentUser, userVote }: PostDetailProps) {
  const router = useRouter()
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes)
  const [localVote, setLocalVote] = useState(userVote)
  const [localComments, setLocalComments] = useState(comments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  const handleUpvote = async () => {
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    const supabase = createClient()
    const newVote = localVote === 1 ? 0 : 1
    const voteDiff = newVote - (localVote || 0)

    setLocalVote(newVote)
    setLocalUpvotes((prev) => prev + voteDiff)

    if (newVote === 0) {
      await supabase.from("votes").delete().match({ post_id: post.id, user_id: currentUser.id })
    } else {
      await supabase.from("votes").upsert({
        post_id: post.id,
        user_id: currentUser.id,
        value: newVote,
      })
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Failed to start recording:", err)
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const clearAudio = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
  }

  const submitComment = async () => {
    if (!currentUser || (!newComment.trim() && !audioBlob)) return

    setIsSubmitting(true)
    const supabase = createClient()

    // For voice comments, we'd upload to storage first
    // For now, just submit text comments
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        user_id: currentUser.id,
        content: newComment.trim() || "[Voice Comment]",
        voice_url: null, // Would be the uploaded URL
      })
      .select(`*, profiles (*)`)
      .single()

    if (!error && data) {
      setLocalComments((prev) => [...prev, data as Comment & { profiles: Profile }])
      setNewComment("")
      clearAudio()
    }

    setIsSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Post */}
      <article className="glass-card rounded-xl p-4 mb-4">
        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/u/${post.profiles?.username}`}>
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage src={post.profiles?.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary">
                {post.profiles?.display_name?.[0] || post.profiles?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link href={`/u/${post.profiles?.username}`} className="font-semibold text-foreground hover:text-primary">
              {post.profiles?.display_name || post.profiles?.username}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>@{post.profiles?.username}</span>
              <span>·</span>
              <span>{timeAgo}</span>
            </div>
          </div>
          {post.categories && (
            <Badge style={{ backgroundColor: post.categories.color, color: "#fff" }}>{post.categories.name}</Badge>
          )}
        </div>

        {/* Title */}
        {post.title && <h1 className="text-xl font-bold text-foreground mb-3">{post.title}</h1>}

        {/* Content */}
        <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>

        {/* Image */}
        {post.image_url && (
          <div className="rounded-xl overflow-hidden mb-4 border border-border/50">
            <img src={post.image_url || "/placeholder.svg"} alt="Post attachment" className="w-full object-cover" />
          </div>
        )}

        {/* Interactions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <Button
            variant="ghost"
            onClick={handleUpvote}
            className={cn("h-10 px-4", localVote === 1 && "text-primary bg-primary/10")}
          >
            <ArrowUp className={cn("h-5 w-5 mr-2", localVote === 1 && "fill-current")} />
            {localUpvotes}
          </Button>
          <Button variant="ghost" className="h-10 px-4">
            <MessageCircle className="h-5 w-5 mr-2" />
            {localComments.length}
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Bookmark className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </article>

      {/* Comment input */}
      {currentUser ? (
        <div className="glass-card rounded-xl p-4 mb-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 border border-border flex-shrink-0">
              <AvatarImage src={currentUser.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary">
                {currentUser.display_name?.[0] || currentUser.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[80px] bg-secondary/50 border-border/50 focus:border-primary resize-none"
              />

              {/* Voice recording UI */}
              {audioUrl && (
                <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                  <Button variant="ghost" size="icon" onClick={playAudio} className="h-8 w-8">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1 h-1 bg-primary/30 rounded-full">
                    <div className="h-full w-1/2 bg-primary rounded-full" />
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearAudio} className="text-xs text-muted-foreground">
                    Remove
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn(isRecording && "animate-pulse")}
                >
                  {isRecording ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Comment
                    </>
                  )}
                </Button>
                <Button
                  onClick={submitComment}
                  disabled={isSubmitting || (!newComment.trim() && !audioBlob)}
                  className="bg-primary text-primary-foreground"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 mb-4 text-center">
          <p className="text-muted-foreground mb-2">Sign in to join the conversation</p>
          <Link href="/auth/login">
            <Button className="bg-primary text-primary-foreground">Sign In</Button>
          </Link>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="font-semibold text-foreground">Comments ({localComments.length})</h2>
        {localComments.length > 0 ? (
          localComments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
        ) : (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CommentCard({ comment }: { comment: Comment & { profiles: Profile } }) {
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex gap-3">
        <Link href={`/u/${comment.profiles.username}`}>
          <Avatar className="h-10 w-10 border border-border flex-shrink-0">
            <AvatarImage src={comment.profiles.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary">
              {comment.profiles.display_name?.[0] || comment.profiles.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/u/${comment.profiles.username}`} className="font-medium text-foreground hover:text-primary">
              {comment.profiles.display_name || comment.profiles.username}
            </Link>
            <span className="text-sm text-muted-foreground">{timeAgo}</span>
          </div>

          {comment.voice_url ? (
            <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Play className="h-4 w-4" />
              </Button>
              <div className="flex-1 h-1 bg-primary/30 rounded-full" />
              <span className="text-xs text-muted-foreground">
                {comment.voice_duration ? `${comment.voice_duration}s` : "Voice"}
              </span>
            </div>
          ) : (
            <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>
      </div>
    </div>
  )
}
