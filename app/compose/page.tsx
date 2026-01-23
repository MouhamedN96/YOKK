import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { ComposeForm } from '@/components/compose/ComposeForm'
import { redirect } from 'next/navigation'

export default async function ComposePage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <ComposeForm profile={profile} />
    </div>
  )
}
