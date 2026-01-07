"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Rocket, Link2, Hash, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { Profile, Category } from "@/lib/types"

interface ProductSubmitFormProps {
  profile: Profile | null
  categories: Category[]
}

export function ProductSubmitForm({ profile, categories }: ProductSubmitFormProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [tagline, setTagline] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!profile || !name.trim() || !description.trim()) return

    setIsSubmitting(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: profile.id,
        type: "product",
        title: name.trim(),
        content: `${tagline ? tagline + "\n\n" : ""}${description.trim()}${websiteUrl ? "\n\n🔗 " + websiteUrl : ""}`,
        category_id: categoryId || null,
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
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim() || !description.trim()}
          className="bg-primary text-primary-foreground"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Launching...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4 mr-2" />
              Launch Product
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary">
              {profile?.display_name?.[0] || profile?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{profile?.display_name || profile?.username}</p>
            <p className="text-sm text-muted-foreground">Launching a new product</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Product Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What's your product called?"
              className="bg-secondary/50 border-border/50 focus:border-primary h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline" className="text-foreground">
              Tagline
            </Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A catchy one-liner (e.g., 'The Figma for African Developers')"
              className="bg-secondary/50 border-border/50 focus:border-primary h-11"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the community about your product. What problem does it solve? Who is it for?"
              className="min-h-[150px] bg-secondary/50 border-border/50 focus:border-primary resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-secondary/50 border-border/50">
                  <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span style={{ color: cat.color }}>{cat.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-foreground">
                Website URL
              </Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourproduct.com"
                  className="pl-10 bg-secondary/50 border-border/50 focus:border-primary h-11"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
