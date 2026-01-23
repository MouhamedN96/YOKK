'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, Rocket, Trophy, PlusCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Questions', href: '/questions', icon: MessageCircle },
  { label: 'Launches', href: '/launches', icon: Rocket },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
]

export default function MobileNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="
      lg:hidden fixed bottom-0 left-0 right-0 z-50
      bg-charcoal-base/95 backdrop-blur-xl
      border-t border-white/10
      safe-area-inset-bottom
    ">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="
                relative flex flex-col items-center gap-1
                px-4 py-2 rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-violet-500/50
              "
            >
              {/* Active Background */}
              {active && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="
                    absolute inset-0
                    bg-gradient-to-r from-violet-500/20 to-emerald-500/20
                    rounded-lg
                  "
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div className="relative">
                <Icon className={`
                  w-6 h-6 transition-colors duration-200
                  ${active ? 'text-violet-400' : 'text-clay-white/60'}
                `} />
              </div>

              {/* Label */}
              <span className={`
                relative text-xs font-medium
                ${active ? 'text-clay-white' : 'text-clay-white/60'}
              `}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Floating Action Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="
            relative -mt-8
            w-14 h-14 rounded-full
            bg-gradient-to-br from-violet-500 to-emerald-500
            flex items-center justify-center
            shadow-lg shadow-violet-500/50
            focus:outline-none focus:ring-2 focus:ring-violet-500/50
          "
        >
          <PlusCircle className="w-7 h-7 text-white" />
        </motion.button>
      </div>
    </nav>
  )
}
