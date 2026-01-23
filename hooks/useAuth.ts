'use client'

import { useAuth as useAuthProvider } from '@/components/providers/AuthProvider'

// Re-export the hook from the provider
// This ensures backward compatibility with existing components importing from hooks/useAuth
export const useAuth = useAuthProvider