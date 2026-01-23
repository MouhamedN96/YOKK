'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Loader2, Hammer, BookOpen, Users } from 'lucide-react'

// Steps
type Step = 'username' | 'role' | 'interests'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile, updateProfile } = useAuth()
  const [step, setStep] = useState<Step>('username')
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<'builder' | 'learner' | 'connector' | null>(null)
  const [interests, setInterests] = useState<string[]>([])

  // Redirect if not logged in
  if (!user && typeof window !== 'undefined') {
    // router.push('/login') 
    // Commented out to prevent flicker during hydration, Middleware handles this
  }

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.length < 3) return
    
    setLoading(true)
    // TODO: Check availability
    setStep('role')
    setLoading(false)
  }

  const handleRoleSelect = (selected: 'builder' | 'learner' | 'connector') => {
    setRole(selected)
    setStep('interests')
  }

  const handleComplete = async () => {
    if (!user) return
    setLoading(true)
    
    try {
      // Update Profile
      await updateProfile(user.id, {
        username: username || profile?.username || `user_${user.id.slice(0,8)}`,
        // Store role in interests or a JSON field since schema doesn't have 'role' column yet
        // We will put it in interests for now: `role:builder`
        interests: [...interests, `role:${role}`],
        updated_at: new Date().toISOString()
      })
      
      router.push('/')
    } catch (e) {
      console.error('Onboarding failed', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
            animate={{ 
              width: step === 'username' ? '33%' : step === 'role' ? '66%' : '100%' 
            }}
          />
        </div>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: USERNAME */}
          {step === 'username' && (
            <motion.div
              key="username"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">What should we call you?</h2>
                <p className="text-white/60">Choose a unique username for the community.</p>
              </div>

              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={username.length < 3 || loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                >
                  Continue
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: ROLE */}
          {step === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Choose your path</h2>
                <p className="text-white/60">How will you use YOKK?</p>
              </div>

              <div className="grid gap-4">
                {[
                  { id: 'builder', icon: Hammer, title: 'The Builder', desc: 'I want to launch products' },
                  { id: 'learner', icon: BookOpen, title: 'The Learner', desc: 'I want to gain skills' },
                  { id: 'connector', icon: Users, title: 'The Connector', desc: 'I want to find peers' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleRoleSelect(item.id as any)}
                    className="
                      flex items-center gap-4 p-4 rounded-xl
                      bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50
                      transition-all group text-left
                    "
                  >
                    <div className="p-3 rounded-lg bg-gradient-to-br from-white/5 to-white/0 group-hover:from-violet-500/20 group-hover:to-emerald-500/20">
                      <item.icon className="w-6 h-6 text-white group-hover:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <p className="text-sm text-white/50">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: INTERESTS */}
          {step === 'interests' && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">What interests you?</h2>
                <p className="text-white/60">Select at least 3 topics.</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {['React', 'Next.js', 'Python', 'AI', 'Flutter', 'Rust', 'DevOps', 'Crypto', 'Design', 'Marketing', 'SaaS', 'AgTech'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (interests.includes(tag)) {
                        setInterests(interests.filter(i => i !== tag))
                      } else {
                        setInterests([...interests, tag])
                      }
                    }}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium border transition-all
                      ${interests.includes(tag)
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <button
                onClick={handleComplete}
                disabled={interests.length < 3 || loading}
                className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Complete Setup
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}