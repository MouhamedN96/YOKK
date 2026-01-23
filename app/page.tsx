'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import { useChat } from 'ai/react' // TODO: Fix package export
import { useQuery } from '@powersync/react'

// Mock useChat for build stability
const useChat = (config: any) => {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const append = (msg: any) => {
    setMessages(prev => [...prev, msg])
    setIsLoading(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: "I'm Bo AI. I'm currently offline-optimized, but I'll be fully connected to Groq soon!" 
      }])
      setIsLoading(false)
    }, 1000)
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (!input.trim()) return
    append({ role: 'user', content: input })
    setInput('')
  }

  return {
    messages,
    input,
    handleInputChange: (e: any) => setInput(e.target.value),
    handleSubmit,
    isLoading,
    append
  }
}
import { ModernHeroCard, type ModernHeroCardData } from '@/components/design/cards/ModernHeroCard'
import { MobileOptimizedCard, type MobileOptimizedCardData } from '@/components/design/cards/MobileOptimizedCard'
import { Sidebar } from '@/components/design/sidebar/Sidebar'
import { ThemeToggle } from '@/components/design/theme/ThemeToggle'
import { CreatePostMenu } from '@/components/design/header/CreatePostMenu'
import { StreakDisplay } from '@/components/design/gamification/StreakDisplay'
import { LevelBadge } from '@/components/design/gamification/LevelBadge'
import { Menu, Search, Bell, User, Sparkles, Rocket, MessageSquare, Flame, ChevronUp, Home as HomeIcon, Video, Briefcase, Plus, Send, Loader2 } from 'lucide-react'
import { posts } from '@/lib/supabase/posts'
import { useAuth } from '@/hooks/useAuth'
import type { PostWithProfile } from '@/lib/supabase/types'

// Type definitions for feed items
type LaunchItem = {
  id: string
  type: 'launch'
  title: any
  imageUrl: string
  votes: number
  comments: number
  author: string
  avatar: string
  excerpt: any
}

type PostItem = {
  id: string
  type: string
  title: any
  excerpt: any
  votes: number
  comments: number
  tags: string[]
  author: string
  avatar: string
}

type FeedItem = LaunchItem | PostItem

export default function Home() {
  // Auth
  const { user: authUser, profile, loading: authLoading } = useAuth()

  // AI Chat
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/bo/chat',
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  // PowerSync Data
  const { data: launches = [] } = useQuery('SELECT * FROM launches ORDER BY upvotes DESC')
  const { data: dbPosts = [] } = useQuery('SELECT * FROM posts ORDER BY upvotes DESC')

  // Combine and format data
  const feedItems = useMemo(() => {
    const formattedLaunches = launches.map((l: any) => ({
      id: l.id,
      type: 'launch' as const,
      title: l.title,
      imageUrl: l.image_url || '',
      votes: l.upvotes,
      comments: 0, // TODO: Add comment count to schema
      author: 'Builder', // TODO: Join with profiles
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + l.author_id,
      excerpt: l.tagline
    }))

    const formattedPosts = dbPosts.map((p: any) => ({
      id: p.id,
      type: p.type as string,
      title: p.title,
      excerpt: p.content,
      votes: p.upvotes,
      comments: p.comment_count,
      tags: JSON.parse(p.tags || '[]') as string[],
      author: 'Dev', // TODO: Join with profiles
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.author_id,
    }))

    return [...formattedLaunches, ...formattedPosts].sort((a, b) => b.votes - a.votes)
  }, [launches, dbPosts])

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  
  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Mock User (Moussa)
  const user = {
    name: profile?.username || 'Moussa',
    avatar: profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa',
    level: profile?.level || 5,
    xp: profile?.xp || 2450,
    streak: profile?.streak_days || 12,
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-terracotta-primary/30 pb-20 md:pb-0">
      
      {/* 1. MOBILE HEADER (Gamified) */}
      <div className="md:hidden sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3" onClick={() => setSidebarOpen(true)}>
          <img src={user.avatar} className="w-8 h-8 rounded-full border border-white/20" />
          <LevelBadge xp={user.xp} compact />
        </div>
        
        {/* Central Logo */}
        <h1 className="text-lg font-bold bg-gradient-to-r from-terracotta-primary to-savanna-gold bg-clip-text text-transparent">
          NJOOBA
        </h1>

        <div className="flex items-center gap-3">
          <StreakDisplay days={user.streak} />
          <Bell className="text-white/70" size={20} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        
        {/* 2. LEFT SIDEBAR (Desktop Nav) */}
        <div className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-black border-r border-white/10 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen transition-transform duration-200`}>
          <div className="p-6 h-full flex flex-col">
            <h1 className="hidden md:block text-2xl font-bold bg-gradient-to-r from-terracotta-primary to-savanna-gold bg-clip-text text-transparent mb-8">NJOOBA</h1>
            
            <div className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-white/5 border border-white/10">
              <img src={user.avatar} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-bold">{user.name}</div>
                <div className="text-xs text-white/50">Level {user.level} • Builder</div>
              </div>
            </div>

            <nav className="space-y-1 flex-1">
              {[
                { icon: HomeIcon, label: 'Home', id: 'home' },
                { icon: Flame, label: 'Trending', id: 'trending' },
                { icon: Rocket, label: 'Launches', id: 'launches' },
                { icon: MessageSquare, label: 'Discussions', id: 'discussions' },
                { icon: Briefcase, label: 'Jobs', id: 'jobs' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium transition-all ${activeTab === item.id ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                >
                  <item.icon size={24} />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Daily Streak</span>
                <StreakDisplay days={user.streak} />
              </div>
              <button 
                onClick={() => setAiDrawerOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-primary to-sunset-orange text-white font-bold shadow-lg shadow-terracotta-primary/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                Ask Bo AI
              </button>
            </div>
          </div>
        </div>

        {/* 3. CENTER FEED (Bilibili Style Grid) */}
        <main className="flex-1 min-w-0 border-r border-white/10 bg-black">
          {/* Feed Filter Tabs */}
          <div className="sticky top-14 md:top-0 z-30 bg-black/95 backdrop-blur-md border-b border-white/10 overflow-x-auto">
            <div className="flex px-4 py-3 gap-6">
              {['For You', 'Following', 'Dev', 'Design', 'Crypto'].map((tab, i) => (
                <button key={tab} className={`whitespace-nowrap font-medium text-sm ${i === 0 ? 'text-white border-b-2 border-terracotta-primary pb-3 -mb-3.5' : 'text-white/50'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* PINNED HERO: NJOOBA VALUE PROP */}
            <div className="sm:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-terracotta-primary/20 via-black to-savanna-gold/10 border border-white/10 p-8 mb-4">
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 rounded-md bg-terracotta-primary text-[10px] font-black tracking-tighter text-white">AFRICA FIRST</span>
                  <span className="text-white/40 text-xs font-medium uppercase tracking-widest">Version 1.0 Live</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                  Build for Africa, <br/>
                  <span className="text-gradient-sunset">with Africa.</span>
                </h2>
                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                  Join 5,000+ developers in the first AI-native community platform designed for our reality. 2G optimized, offline-ready, and locally relevant.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-8 py-3 rounded-full bg-white text-black font-black hover:bg-white/90 transition-transform active:scale-95">
                    Join NJOOBA
                  </button>
                  <button className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-transform active:scale-95">
                    Explore Launches 🚀
                  </button>
                </div>
              </div>
              
              {/* Background Glows */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-terracotta-primary/20 blur-[100px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-savanna-gold/10 blur-[100px] rounded-full" />
            </div>

            {feedItems.map((item) => {
              // BILIBILI STYLE: Dense Image Cards for Launches
              if (item.type === 'launch') {
                const launchItem = item as LaunchItem
                return (
                  <article key={item.id} className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer transition-all duration-300 hover:border-terracotta-primary/50 hover:shadow-2xl hover:shadow-terracotta-primary/10">
                    <img src={launchItem.imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl text-[10px] font-black tracking-widest text-white border border-white/10 uppercase">
                        🚀 Launch
                      </span>
                      {item.votes > 1000 && (
                        <span className="px-3 py-1 rounded-full bg-orange-500 text-[10px] font-black tracking-widest text-white uppercase flex items-center gap-1">
                          <Flame size={10} fill="currentColor" /> Trending
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-xl font-black text-white leading-tight mb-3 drop-shadow-lg">{item.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={item.avatar} className="w-6 h-6 rounded-full border border-white/20" />
                          <span className="text-xs font-bold text-white/80">{item.author}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 group-hover:bg-terracotta-primary transition-colors">
                          <ChevronUp size={14} className="text-white" />
                          <span className="text-xs font-black text-white">{item.votes}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              }

              // STACK OVERFLOW / X STYLE: Full width text cards
              return (
                <article key={item.id} className="sm:col-span-2 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 cursor-pointer group">
                  <div className="flex gap-6">
                     <div className="flex flex-col items-center gap-1 min-w-[48px]">
                      <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center transition-all group-hover:border-terracotta-primary/50 hover:bg-terracotta-primary group">
                        <ChevronUp className="text-white/40 group-hover:text-white transition-colors" />
                        <span className="text-sm font-black text-white/90 group-hover:text-white">{item.votes}</span>
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={item.avatar} className="w-6 h-6 rounded-full" />
                        <span className="font-black text-sm text-white/90">{item.author}</span>
                        <span className="text-white/30 text-xs">· 4h ago</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-black border border-blue-500/20 uppercase tracking-tighter">{item.type}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-3 group-hover:text-terracotta-primary transition-colors leading-tight">{item.title}</h3>
                      <p className="text-white/60 text-base leading-relaxed mb-4 line-clamp-2">{item.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {'tags' in item && item.tags?.map((tag: string) => (
                            <span key={tag} className="text-xs font-bold text-terracotta-primary/80 hover:text-terracotta-primary">#{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-white/40">
                          <span className="flex items-center gap-1.5 text-xs font-bold hover:text-white transition-colors">
                            <MessageSquare size={16} /> {item.comments}
                          </span>
                          <span className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <Rocket size={16} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </main>

        {/* 4. RIGHT SIDEBAR (Trending) */}
        <div className="hidden lg:block w-[320px] p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input type="text" placeholder="Search..." className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 text-sm text-white focus:outline-none focus:border-terracotta-primary" />
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Trending in Senegal</h2>
            {[1, 2, 3].map(i => (
              <div key={i} className="py-3 border-b border-white/5 last:border-0">
                <div className="text-xs text-white/40 mb-1">Tech · Trending</div>
                <div className="font-bold text-white">#OrangeMoneyAPI</div>
                <div className="text-xs text-white/40 mt-1">2.4K posts</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. MOBILE BOTTOM NAV (Truth Social Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 pb-safe z-50">
        <div className="flex items-center justify-around h-16 relative">
          <button className={`p-2 ${activeTab === 'home' ? 'text-terracotta-primary' : 'text-white/40'}`} onClick={() => setActiveTab('home')}>
            <HomeIcon size={24} />
          </button>
          <button className={`p-2 ${activeTab === 'explore' ? 'text-terracotta-primary' : 'text-white/40'}`} onClick={() => setActiveTab('explore')}>
            <Search size={24} />
          </button>
          
          {/* Floating AI Button (Grok Style) */}
          <div className="relative -top-5">
            <button 
              onClick={() => setAiDrawerOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-terracotta-primary to-savanna-gold flex items-center justify-center shadow-lg shadow-terracotta-primary/30 border-4 border-black"
            >
              <Sparkles size={24} className="text-white fill-white" />
            </button>
          </div>

          <button className={`p-2 ${activeTab === 'notifs' ? 'text-terracotta-primary' : 'text-white/40'}`} onClick={() => setActiveTab('notifs')}>
            <Bell size={24} />
          </button>
          <button className={`p-2 ${activeTab === 'jobs' ? 'text-terracotta-primary' : 'text-white/40'}`} onClick={() => setActiveTab('jobs')}>
            <Briefcase size={24} />
          </button>
        </div>
      </div>

      {/* 6. AI DRAWER (Grok Style Overlay) */}
      <AnimatePresence>
        {aiDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[85vh] bg-[#0A0A0A] rounded-t-3xl border-t border-white/10 z-[51] flex flex-col shadow-2xl"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-4 flex-shrink-0" />
              
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta-primary/20 to-savanna-gold/20 flex items-center justify-center mb-6">
                      <Sparkles size={32} className="text-terracotta-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Ask Bo AI</h2>
                    <p className="text-white/50 max-w-xs mb-8">
                      Your context-aware coding assistant. Ask about local payments, offline patterns, or 2G optimization.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                      {[
                        'How to integrate Orange Money?', 
                        'Optimize Next.js for 2G', 
                        'Offline-first with PowerSync', 
                        'What is NJOOBA?'
                      ].map(q => (
                        <button 
                          key={q} 
                          onClick={() => append({ role: 'user', content: q })}
                          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-left transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl ${
                        m.role === 'user' 
                          ? 'bg-terracotta-primary text-white' 
                          : 'bg-white/5 border border-white/10 text-white/90'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <Loader2 className="w-5 h-5 text-terracotta-primary animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 bg-black flex-shrink-0">
                <form onSubmit={handleSubmit} className="relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask anything..." 
                    className="w-full bg-white/10 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white placeholder-white/40 focus:outline-none focus:border-terracotta-primary focus:bg-white/5 transition-all"
                    autoFocus
                  />
                  <button 
                    disabled={isLoading || !input.trim()}
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-terracotta-primary flex items-center justify-center hover:bg-terracotta-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} className="text-white" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
