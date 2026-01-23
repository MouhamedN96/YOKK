import React from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { AuthProvider } from '@/components/providers/AuthProvider'

import { redirect } from 'next/navigation'

interface MainLayoutProps {
  children: React.ReactNode
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const supabase = await createClient()

  // Fetch Session (SSR)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let profile = null

  if (session?.user) {
    // Fetch Profile (SSR)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    profile = data

    // Force Onboarding if no username
    if (profile && !profile.username) {
      redirect('/onboarding')
    }
  }

  return (
    <AuthProvider initialSession={session} initialProfile={profile}>
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Header - Needs to be Client Component for Interactivity, but passed User Data? 
            Actually, Header uses useAuth() inside, so it will pick up the context provided by AuthProvider.
        */}
        <Header />

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Uses useAuth() inside */}
          <Sidebar />

          <main className="
            flex-1 overflow-y-auto
            bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a]
          ">
            <div className="
              max-w-7xl mx-auto
              px-4 sm:px-6 lg:px-8
              py-6 sm:py-8 lg:py-12
            ">
              <div className="relative">
                <div className="
                  absolute -top-40 -left-40
                  w-96 h-96 rounded-full
                  bg-violet-500/5 blur-3xl
                  pointer-events-none
                " />
                <div className="
                  absolute -bottom-40 -right-40
                  w-96 h-96 rounded-full
                  bg-emerald-500/5 blur-3xl
                  pointer-events-none
                " />
                <div className="relative z-10">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}