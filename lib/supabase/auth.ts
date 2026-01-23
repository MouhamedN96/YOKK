import { supabase } from './client'
import type { Database } from './types'

type Profile = Database['public']['Tables']['profiles']['Row']

// Input validation helpers
const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }

  // Strengthened: minimum 12 characters (was 8)
  if (password.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters' }
  }

  // Require uppercase, lowercase, number, and special character
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
    return { valid: false, error: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)' }
  }

  // Check against common weak passwords
  const commonPasswords = [
    'password123', 'Password123!', 'Admin123!', 'Welcome123!',
    '123456789012', 'Qwerty123456!', 'Letmein123!', 'Password1!',
  ]
  const lowerPassword = password.toLowerCase()
  if (commonPasswords.some(common => lowerPassword.includes(common.toLowerCase()))) {
    return { valid: false, error: 'Password is too common. Please choose a stronger password' }
  }

  return { valid: true }
}

const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username || !username.trim()) {
    return { valid: false, error: 'Username is required' }
  }

  if (username.length < 3 || username.length > 20) {
    return { valid: false, error: 'Username must be 3-20 characters' }
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' }
  }

  return { valid: true }
}

export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, username: string) => {
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return { data: null, error: { message: emailValidation.error } }
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return { data: null, error: { message: passwordValidation.error } }
    }

    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      return { data: null, error: { message: usernameValidation.error } }
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          username: username.trim(),
        },
      },
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return { data: null, error: { message: emailValidation.error } }
    }

    if (!password) {
      return { data: null, error: { message: 'Password is required' } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  // Get current user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },

  // Get user profile
  getUserProfile: async (userId: string): Promise<{ data: Profile | null; error: any }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return { data, error }
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  // OAuth sign in (Google, GitHub, etc.)
  signInWithOAuth: async (provider: 'google' | 'github' | 'twitter') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    return { data, error }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}
