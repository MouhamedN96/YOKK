'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/design/utils'

interface MenuItem {
  icon: string
  label: string
  route: string
}

interface CreatePostMenuProps {
  className?: string
}

export const CreatePostMenu: React.FC<CreatePostMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const menuItems: MenuItem[] = [
    { icon: '📝', label: 'Write Article', route: '/create/article' },
    { icon: '💬', label: 'Start Discussion', route: '/create/discussion' },
    { icon: '🚀', label: 'Submit App', route: '/create/app' },
    { icon: '📅', label: 'Create Event', route: '/create/event' },
    { icon: '💡', label: 'Share Idea', route: '/create/idea' },
  ]

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleItemClick = (route: string) => {
    setIsOpen(false)
    // Router navigation would go here
    console.log('Navigate to:', route)
  }

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
          'border border-savanna-gold/40 text-savanna-gold',
          'hover:bg-savanna-gold/10 hover:border-savanna-gold',
          'active:scale-95'
        )}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Post</span>
      </motion.button>

      {/* Desktop Dropdown */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'absolute top-full right-0 mt-2 w-[200px] z-50',
                'rounded-xl overflow-hidden',
                'bg-black/95 backdrop-blur-xl',
                'border border-white/10',
                'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
                'p-2'
              )}
            >
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.route}
                  onClick={() => handleItemClick(item.route)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'w-full h-[44px] px-4 flex items-center gap-3 rounded-lg',
                    'text-white text-sm transition-all duration-150',
                    'hover:bg-savanna-gold/10 hover:text-savanna-gold',
                    'cursor-pointer'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 z-50"
                onClick={() => setIsOpen(false)}
              />

              {/* Bottom Sheet */}
              <motion.div
                ref={menuRef}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className={cn(
                  'fixed bottom-0 left-0 right-0 z-50',
                  'bg-black/95 backdrop-blur-xl',
                  'border-t border-white/10',
                  'rounded-t-3xl',
                  'p-6 pb-8'
                )}
              >
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                <h3 className="text-lg font-heading font-bold text-clay-white mb-4">
                  Create Post
                </h3>

                <div className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.route}
                      onClick={() => handleItemClick(item.route)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'w-full h-[56px] px-4 flex items-center gap-4 rounded-xl',
                        'text-white text-base transition-all duration-150',
                        'hover:bg-savanna-gold/10 active:bg-savanna-gold/20',
                        'border border-white/5 hover:border-savanna-gold/30'
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Cancel Button */}
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'w-full h-[56px] mt-4 rounded-xl',
                    'bg-white/5 text-white',
                    'border border-white/10',
                    'font-medium'
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
