import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Lazy singleton for client-side only usage (prevents SSR issues)
let _supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabase = () => {
  if (typeof window === 'undefined') {
    throw new Error('Browser Supabase client can only be used in browser environment');
  }
  if (!_supabaseInstance) {
    _supabaseInstance = createClient();
  }
  return _supabaseInstance;
};

// Note: Use getSupabase() instead of importing supabase directly
// This ensures proper lazy initialization in browser environment
