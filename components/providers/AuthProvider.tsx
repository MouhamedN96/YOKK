'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { auth } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: Error | null
  signIn: typeof auth.signIn
  signUp: typeof auth.signUp
  signOut: () => Promise<void>
  updateProfile: typeof auth.updateProfile
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const CACHE_KEY = 'yokk-profile-cache'

export function AuthProvider({ 
  children, 
  initialSession, 
  initialProfile 
}: { 
  children: React.ReactNode
  initialSession: Session | null
  initialProfile: Profile | null
}) {
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [loading, setLoading] = useState(!initialSession)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  // 1. Load from Offline Cache (Fastest)
  useEffect(() => {
    if (!profile && typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          // Only use cache if we have a user (or think we do)
          // Actually, if we are waiting for server, show cache.
          // If server says "No User" later, we clear it.
          setProfile(parsed)
        } catch (e) {
          console.error('Cache parse error', e)
        }
      }
    }
  }, [])

  // 2. Sync with Supabase (Realtime)
  useEffect(() => {
    const {
      data: { subscription },
    } = auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Fetch latest profile
        const { data } = await auth.getUserProfile(session.user.id)
        if (data) {
          setProfile(data)
          localStorage.setItem(CACHE_KEY, JSON.stringify(data)) // Update Cache
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        setUser(null)
        localStorage.removeItem(CACHE_KEY) // Clear Cache
        router.refresh()
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Custom SignOut to clear cache immediately
  const signOut = async () => {
    setLoading(true)
    await auth.signOut()
    setUser(null)
    setProfile(null)
    localStorage.removeItem(CACHE_KEY)
    setLoading(false)
    router.push('/login')
  }

  const value = {
    user,
    profile,
    loading,
    error,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut,
    updateProfile: auth.updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
