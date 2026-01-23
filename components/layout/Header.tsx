'use client'

import React, { useState, useEffect } from 'react'
import { Search, Sun, Moon, User, Menu, LogOut, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const { user, profile, signOut } = useAuth()

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initialTheme = savedTheme || 'dark'
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const initials = profile?.full_name 
  ? profile.full_name.substring(0, 2).toUpperCase()
  : user?.email?.substring(0, 2).toUpperCase() || 'GU'

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        sticky top-0 z-50 w-full
        transition-all duration-300
        ${isScrolled
          ? 'bg-charcoal-base/95 backdrop-blur-xl border-b border-white/10 shadow-lg'
          : 'bg-charcoal-base/80 backdrop-blur-md border-b border-white/5'
        }
      `}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onMenuClick}
              className="
                lg:hidden p-2 rounded-lg
                text-clay-white/70 hover:text-clay-white
                hover:bg-white/5
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-violet-500/50
              "
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              href="/"
              className="
                flex items-center gap-2 group
                focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded-lg
              "
            >
              <div className="relative">
                <div className="
                  absolute inset-0 bg-gradient-to-r from-violet-500 to-emerald-500
                  rounded-lg blur-md opacity-0 group-hover:opacity-50
                  transition-opacity duration-300
                " />
                <div className="
                  relative bg-gradient-to-br from-violet-500 to-emerald-500
                  text-white font-heading font-bold
                  px-3 py-1.5 rounded-lg
                  text-lg sm:text-xl
                  transition-transform duration-300
                  group-hover:scale-105
                ">
                  YOKK
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl mx-4 sm:mx-8">
            <div className="relative">
              <motion.div
                initial={false}
                animate={{
                  width: isSearchExpanded ? '100%' : 'auto'
                }}
                className="relative"
              >
                <div className="relative flex items-center">
                  <Search
                    className="
                      absolute left-3 sm:left-4
                      w-4 h-4 sm:w-5 sm:h-5
                      text-clay-white/50
                      pointer-events-none
                    "
                  />
                  <input
                    type="text"
                    placeholder="Search questions, launches, people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchExpanded(true)}
                    onBlur={() => {
                      if (!searchQuery) setIsSearchExpanded(false)
                    }}
                    className="
                      w-full
                      pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5
                      bg-white/5 hover:bg-white/8
                      border border-white/10 hover:border-white/20
                      rounded-lg
                      text-clay-white text-sm sm:text-base
                      placeholder:text-clay-white/40
                      focus:outline-none focus:ring-2 focus:ring-violet-500/50
                      focus:border-violet-500/50 focus:bg-white/10
                      transition-all duration-200
                    "
                    aria-label="Search"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right: Theme Toggle + User */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="
                relative p-2 sm:p-2.5 rounded-lg
                bg-white/5 hover:bg-white/10
                border border-white/10 hover:border-white/20
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-violet-500/50
                group
              "
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5 text-savanna-gold group-hover:text-yellow-400 transition-colors" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5 text-indigo-deep group-hover:text-blue-400 transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="
                    flex items-center gap-2 px-4 py-2
                    bg-white/5 hover:bg-white/10
                    border border-white/10 hover:border-white/20
                    rounded-lg
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50
                    group
                  "
                >
                  <div className="
                    w-8 h-8 rounded-full
                    bg-gradient-to-br from-violet-500 to-emerald-500
                    flex items-center justify-center
                    text-white font-bold
                  ">
                     {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                     ) : (
                        initials
                     )}
                  </div>
                  <span className="text-sm font-medium text-clay-white group-hover:text-violet-400 transition-colors">
                    {profile?.username || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-charcoal-base border border-white/10 rounded-lg shadow-xl p-2"
                    >
                      <Link href="/profile" className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-md text-sm">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-md text-sm">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button onClick={() => signOut()} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-md text-sm text-red-400">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:block">
                <Link
                  href="/login"
                  className="
                    flex items-center gap-2 px-4 py-2
                    bg-violet-600 hover:bg-violet-700
                    border border-transparent
                    rounded-lg
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50
                    group
                  "
                >
                  <User className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">
                    Sign In
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}