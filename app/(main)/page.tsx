import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { FeedContent } from '@/components/feed/FeedContent'
import { Loader2 } from 'lucide-react'

// Revalidate every minute
export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Fetch Session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 2. Fetch User Profile (if logged in)
  let profile = null
  if (session?.user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    profile = data
  }

  // 3. Fetch Posts (with profiles)
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (*)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching posts:', error)
    // Fallback UI or Error Boundary will catch
  }

  return (
    <div className="space-y-8">
      {/* Feed Content handles the layout (Posts + Sidebar) */}
      <FeedContent 
        profile={profile} 
        posts={posts || []} 
      />
    </div>
  )
}