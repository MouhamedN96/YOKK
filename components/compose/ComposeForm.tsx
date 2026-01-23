"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImageIcon, Hash, Loader2, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"
import imageCompression from 'browser-image-compression'
import { cn } from "@/lib/utils"

interface ComposeFormProps {
  profile: Profile | null
}

const DRAFT_KEY = 'yokk-post-draft'

const CATEGORIES = [
  { id: 'ai', label: 'AI & ML' },
  { id: 'fintech', label: 'FinTech' },
  { id: 'devtools', label: 'DevTools' },
  { id: 'agtech', label: 'AgTech' },
  { id: 'other', label: 'General' }
]

export function ComposeForm({ profile }: ComposeFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<string>("other")
  const [type, setType] = useState<"discussion" | "question" | "tutorial" | "showcase">("discussion")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Resilience: Load Draft
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      try {
        const { title: t, content: c, category: cat, type: ty } = JSON.parse(saved)
        setTitle(t || "")
        setContent(c || "")
        setCategory(cat || "other")
        setType(ty || "discussion")
      } catch (e) {
        console.error("Failed to load draft", e)
      }
    }
  }, [])

  // 2. Resilience: Save Draft on Change
  useEffect(() => {
    const draft = { title, content, category, type }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [title, content, category, type])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Bandwidth-Aware: Compress before preview/upload
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/webp' as any
      }
      
      const compressedFile = await imageCompression(file, options)
      setImageFile(compressedFile)
      setImagePreview(URL.createObjectURL(compressedFile))
    } catch (error) {
      console.error("Compression error", error)
    }
  }

  const handleSubmit = async () => {
    if (!profile || !content.trim()) return

    setIsSubmitting(true)

    try {
      let imageUrl = null

      // 3. Media Upload (if image selected)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${profile.id}-${Math.random()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      }

      // 4. DB Insert
      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: profile.id,
          content: content.trim(),
          title: title.trim() || (type === 'question' ? 'Question' : 'Post'),
          category: category,
          type: type,
          image_url: imageUrl,
          upvotes: 0,
          comment_count: 0,
          view_count: 0
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        localStorage.removeItem(DRAFT_KEY) // Clear draft on success
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      alert(`Failed to post: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-clay-white/60">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="bg-savanna-gold text-charcoal-base font-bold hover:bg-savanna-gold/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Launching...
            </>
          ) : (
            "Launch Post"
          )}
        </Button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['discussion', 'question', 'tutorial', 'showcase'].map((t) => (
          <Button
            key={t}
            variant={type === t ? "default" : "outline"}
            size="sm"
            onClick={() => setType(t as any)}
            className={cn(
              "capitalize transition-all whitespace-nowrap",
              type === t ? "bg-savanna-gold text-charcoal-base border-savanna-gold" : "text-clay-white/60 border-white/10"
            )}
          >
            {t}
          </Button>
        ))}
      </div>

      {/* Form Container */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12 border border-white/10 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-charcoal-light text-clay-white">
              {profile?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            {/* Title for Tutorials/Showcases */}
            {(type === 'tutorial' || type === 'showcase' || type === 'question') && (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'question' ? "What is your question?" : "Give it a catchy title..."}
                className="text-xl font-heading font-bold bg-transparent border-none px-0 focus-visible:ring-0 text-clay-white placeholder:text-clay-white/20"
              />
            )}

            {/* Content */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts with African developers..."
              className="min-h-[200px] bg-transparent border-none resize-none focus-visible:ring-0 text-clay-white/90 text-lg placeholder:text-clay-white/20 p-0"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 mt-4">
                <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[400px] object-cover" />
                <button 
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bottom Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/5">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-clay-white/80">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-savanna-gold" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-charcoal-base border-white/10 text-clay-white">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1" />

              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageChange}
              />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-clay-white/60 hover:text-savanna-gold hover:bg-white/5"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}