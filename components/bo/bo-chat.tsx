"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Send, Sparkles, Mic, StopCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"

interface BoChatProps {
  user: Profile | null
}

export function BoChat({ user }: BoChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hey${user ? ` ${user.display_name || user.username}` : ""}! I'm Bo, your AI assistant for the African tech ecosystem. I can help you with:\n\n• **Code & Development** - Debug issues, explain concepts, review code\n• **Career Guidance** - Job search tips, interview prep, portfolio advice\n• **Tech Trends** - Latest in African fintech, AI, and startups\n• **Community** - Connect with builders, find collaborators\n\nWhat would you like to explore today?`,
      },
    ],
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    handleSubmit(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/40">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary yokk-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">Bo AI</h1>
          <p className="text-xs text-muted-foreground">Your African tech companion</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
            {/* Avatar */}
            {message.role === "assistant" ? (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            ) : (
              <Avatar className="h-8 w-8 flex-shrink-0 border border-border">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback className="bg-secondary text-sm">
                  {user?.display_name?.[0] || user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Message bubble */}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "glass-card rounded-tl-sm",
              )}
            >
              <div className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Bo is thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/40">
        <form onSubmit={onSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Bo anything..."
              className="min-h-[48px] max-h-32 resize-none bg-secondary/50 border-border/50 focus:border-primary pr-12"
              rows={1}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-accent"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          {isLoading ? (
            <Button type="button" onClick={stop} variant="outline" size="icon" className="h-12 w-12 bg-transparent">
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              className="h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Bo can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  )
}
