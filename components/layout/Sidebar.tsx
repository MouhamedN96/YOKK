'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Home, Compass, Users, Rocket, Trophy, PlusCircle, Sparkles, User as UserIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

// Updated Links to match actual routes
const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Community', href: '/community', icon: Users, badge: 5 },
  { label: 'Launches', href: '/launch', icon: Rocket }, // Matched folder /launch
  { label: 'Trending', href: '/trending', icon: Trophy },
]

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, profile, loading } = useAuth()

  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  // Generate fallback initials
  const initials = profile?.full_name 
    ? profile.full_name.substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'GU'

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Guest User'
  const displayLevel = profile?.level ? `Level ${profile.level}` : 'Visitor'

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="
            lg:hidden fixed inset-0 z-40
            bg-black/60 backdrop-blur-sm
          "
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed lg:sticky top-0 left-0 z-50
          h-screen lg:h-[calc(100vh-5rem)]
          w-64 lg:w-72
          bg-charcoal-base/90 backdrop-blur-xl
          border-r border-white/10
          flex flex-col
          pt-20 lg:pt-8
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 lg:transition-none
        `}
      >
        {/* Sidebar Header */}
        <div className="px-6 mb-6">
          <h2 className="text-xs font-semibold text-clay-white/50 uppercase tracking-wider mb-4">
            Navigation
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group relative flex items-center gap-3
                    px-4 py-3 rounded-lg
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50
                    ${active
                      ? 'bg-gradient-to-r from-violet-500/20 to-emerald-500/20 text-clay-white border border-violet-500/30'
                      : 'text-clay-white/70 hover:text-clay-white hover:bg-white/5'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="
                        absolute left-0 top-1/2 -translate-y-1/2
                        w-1 h-8 rounded-r-full
                        bg-gradient-to-b from-violet-500 to-emerald-500
                      "
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <div className={`
                    relative flex items-center justify-center
                    w-10 h-10 rounded-lg
                    transition-all duration-200
                    ${active
                      ? 'bg-gradient-to-br from-violet-500 to-emerald-500 text-white'
                      : 'bg-white/5 group-hover:bg-white/10 text-clay-white/70 group-hover:text-clay-white'
                    }
                  `}>
                    {active && (
                      <div className="
                        absolute inset-0 rounded-lg
                        bg-gradient-to-br from-violet-500 to-emerald-500
                        blur-md opacity-50
                      " />
                    )}
                    <Icon className={`relative w-5 h-5 ${active ? 'text-white' : ''}`} />
                  </div>

                  {/* Label */}
                  <span className={`
                    flex-1 font-medium text-sm
                    ${active ? 'text-clay-white' : ''}
                  `}>
                    {item.label}
                  </span>

                  {/* Badge */}
                  {item.badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`
                        flex items-center justify-center
                        min-w-[1.5rem] h-6 px-2 rounded-full
                        text-xs font-semibold
                        ${active
                          ? 'bg-white/20 text-white'
                          : 'bg-violet-500/20 text-violet-400 group-hover:bg-violet-500/30'
                        }
                      `}
                    >
                      {item.badge}
                    </motion.div>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* CTA Button */}
        <div className="p-6 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="
              relative w-full group overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded-lg
            "
          >
            <div className="
              absolute inset-0
              bg-gradient-to-r from-violet-500 to-emerald-500
              opacity-100 group-hover:opacity-90
              transition-opacity duration-200
            " />
            
            <div className="
              relative flex items-center justify-center gap-2
              px-4 py-3 rounded-lg
            ">
              <PlusCircle className="w-5 h-5 text-white" />
              <span className="font-semibold text-white">New Post</span>
              <Sparkles className="w-4 h-4 text-white/80 animate-pulse" />
            </div>
          </motion.button>
        </div>

        {/* User Stats Card (Dynamic) */}
        <div className="p-6 border-t border-white/10">
          <Link href={user ? "/profile" : "/login"}>
            <div className="
              p-4 rounded-lg
              bg-gradient-to-br from-white/5 to-white/0
              border border-white/10
              cursor-pointer hover:bg-white/5 transition-colors
            ">
              <div className="flex items-center gap-3 mb-3">
                {profile?.avatar_url ? (
                   <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                    {initials}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-clay-white truncate">{displayName}</p>
                  <p className="text-xs text-clay-white/50">{displayLevel}</p>
                </div>
              </div>
              
              {user && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-clay-white/50">XP Progress</span>
                    <span className="text-clay-white font-medium">{profile?.xp || 0}/1000</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((profile?.xp || 0) / 1000) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>
      </motion.aside>
    </>
  )
}