"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImageIcon, Hash, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { Profile, Category } from "@/lib/types"

interface ComposeFormProps {
  profile: Profile | null
  categories: Category[]
}

export function ComposeForm({ profile, categories }: ComposeFormProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [postType, setPostType] = useState<"post" | "article">("post")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const maxLength = postType === "article" ? 5000 : 500

  const handleSubmit = async () => {
    if (!profile || !content.trim()) return

    setIsSubmitting(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: profile.id,
        content: content.trim(),
        title: postType === "article" ? title.trim() || null : null,
        category_id: categoryId || null,
        type: postType,
        read_time: postType === "article" ? Math.ceil(content.split(" ").length / 200) : null,
      })
      .select()
      .single()

    if (!error && data) {
      router.push(`/post/${data.id}`)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="bg-primary text-primary-foreground"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={postType === "post" ? "default" : "outline"}
          size="sm"
          onClick={() => setPostType("post")}
          className={postType === "post" ? "bg-primary text-primary-foreground" : ""}
        >
          Quick Post
        </Button>
        <Button
          variant={postType === "article" ? "default" : "outline"}
          size="sm"
          onClick={() => setPostType("article")}
          className={postType === "article" ? "bg-primary text-primary-foreground" : ""}
        >
          Article
        </Button>
      </div>

      {/* Form */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 border border-border flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary">
              {profile?.display_name?.[0] || profile?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            {/* Title for articles */}
            {postType === "article" && (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title..."
                className="text-lg font-semibold bg-transparent border-none px-0 focus-visible:ring-0"
              />
            )}

            {/* Content */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={postType === "article" ? "Write your article..." : "What's happening?"}
              className="min-h-[150px] bg-transparent border-none resize-none focus-visible:ring-0 text-foreground"
              maxLength={maxLength}
            />

            {/* Character count */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={content.length > maxLength * 0.9 ? "text-destructive" : ""}>
                {content.length}/{maxLength}
              </span>
            </div>

            {/* Options */}
            <div className="flex items-center gap-2 pt-4 border-t border-border/40">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-[140px] bg-secondary/50 border-border/50">
                  <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span style={{ color: cat.color }}>{cat.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
