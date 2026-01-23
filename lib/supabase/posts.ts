import { supabase } from './client'
import type { Database } from './types'

type Post = Database['public']['Tables']['posts']['Row']
type PostInsert = Database['public']['Tables']['posts']['Insert']

// Pagination helper
const validatePagination = (page: number, limit: number) => {
  const validPage = Math.max(1, Math.floor(page))
  const validLimit = Math.min(100, Math.max(1, Math.floor(limit)))
  return { validPage, validLimit }
}

export const posts = {
  // Get all posts with pagination
  getAll: async (page = 1, limit = 20) => {
    const { validPage, validLimit } = validatePagination(page, limit)
    const from = (validPage - 1) * validLimit
    const to = from + validLimit - 1

    const { data, error, count } = await supabase
      .from('posts')
      .select('*, profiles(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    return { data, error, count }
  },

  // Get posts by category
  getByCategory: async (category: string, page = 1, limit = 20) => {
    const { validPage, validLimit } = validatePagination(page, limit)
    const from = (validPage - 1) * validLimit
    const to = from + validLimit - 1

    const { data, error, count } = await supabase
      .from('posts')
      .select('*, profiles(*)', { count: 'exact' })
      .eq('category', category)
      .order('created_at', { ascending: false })
      .range(from, to)

    return { data, error, count }
  },

  // Get single post by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(*)')
      .eq('id', id)
      .single()

    return { data, error }
  },

  // Create new post
  create: async (post: PostInsert) => {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select('*, profiles(*)')
      .single()

    return { data, error }
  },

  // Update post
  update: async (id: string, updates: Partial<PostInsert>) => {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select('*, profiles(*)')
      .single()

    return { data, error }
  },

  // Delete post
  delete: async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id)

    return { error }
  },

  // Upvote post (with race condition handling)
  upvote: async (postId: string, userId: string) => {
    try {
      // Check if already upvoted
      const { data: existing, error: checkError } = await supabase
        .from('upvotes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)

      // Handle Supabase PGRST116 error (no rows found) gracefully
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existing && existing.length > 0) {
        // Remove upvote
        const { error } = await supabase
          .from('upvotes')
          .delete()
          .eq('id', existing[0].id)

        if (error) throw error

        // Decrement upvote count
        await supabase.rpc('decrement_post_upvotes', { post_id: postId })
        return { removed: true, error: null }
      } else {
        // Add upvote - unique constraint prevents double insert
        const { error } = await supabase
          .from('upvotes')
          .insert({ user_id: userId, post_id: postId })

        if (error && error.code === '23505') {
          // Unique violation - already upvoted, remove it instead
          await supabase
            .from('upvotes')
            .delete()
            .eq('user_id', userId)
            .eq('post_id', postId)
          await supabase.rpc('decrement_post_upvotes', { post_id: postId })
          return { removed: true, error: null }
        } else if (error) {
          throw error
        }

        // Increment upvote count
        await supabase.rpc('increment_post_upvotes', { post_id: postId })
        return { removed: false, error: null }
      }
    } catch (error: any) {
      console.error('Upvote error:', error)
      return { removed: false, error }
    }
  },

  // Get trending posts (by upvotes in last 7 days)
  getTrending: async (limit = 10) => {
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)))
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(*)')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('upvotes', { ascending: false })
      .limit(validLimit)

    return { data, error }
  },

  // Search posts
  search: async (query: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(*)')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    return { data, error }
  },
}
