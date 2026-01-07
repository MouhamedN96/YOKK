"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Sparkles } from "lucide-react"

export default function SignUpPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
          data: {
            username: username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
            display_name: username,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-2xl yokk-glow">
              Y
            </div>
          </Link>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Join YOKK</h1>
            <p className="text-sm text-muted-foreground mt-1">Build with Africa&apos;s tech community</p>
          </div>

          {/* Sign up form */}
          <div className="w-full glass-card rounded-xl p-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="yourname"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary h-11"
                />
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </div>

          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          {/* Bo AI teaser */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Get started with Bo AI assistant</span>
          </div>
        </div>
      </div>
    </div>
  )
}
