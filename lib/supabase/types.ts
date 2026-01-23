export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website_url: string | null
          github_url: string | null
          twitter_url: string | null
          level: number
          xp: number
          streak_days: number
          last_activity_date: string | null
          total_posts: number
          total_comments: number
          helpful_comments: number
          total_launches: number
          preferred_languages: string[] | null
          interests: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
          level?: number
          xp?: number
          streak_days?: number
          last_activity_date?: string | null
          total_posts?: number
          total_comments?: number
          helpful_comments?: number
          total_launches?: number
          preferred_languages?: string[] | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
          level?: number
          xp?: number
          streak_days?: number
          last_activity_date?: string | null
          total_posts?: number
          total_comments?: number
          helpful_comments?: number
          total_launches?: number
          preferred_languages?: string[] | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          title: string
          content: string
          type: 'question' | 'tutorial' | 'discussion' | 'showcase'
          category: string | null
          tags: string[] | null
          image_url: string | null
          upvotes: number
          comment_count: number
          view_count: number
          is_answered: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          content: string
          type?: 'question' | 'tutorial' | 'discussion' | 'showcase'
          category?: string | null
          tags?: string[] | null
          image_url?: string | null
          upvotes?: number
          comment_count?: number
          view_count?: number
          is_answered?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          content?: string
          type?: 'question' | 'tutorial' | 'discussion' | 'showcase'
          category?: string | null
          tags?: string[] | null
          image_url?: string | null
          upvotes?: number
          comment_count?: number
          view_count?: number
          is_answered?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          parent_comment_id: string | null
          content: string
          upvotes: number
          is_accepted: boolean
          is_helpful: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          parent_comment_id?: string | null
          content: string
          upvotes?: number
          is_accepted?: boolean
          is_helpful?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          parent_comment_id?: string | null
          content?: string
          upvotes?: number
          is_accepted?: boolean
          is_helpful?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      launches: {
        Row: {
          id: string
          author_id: string
          title: string
          tagline: string
          description: string | null
          logo_url: string | null
          image_url: string | null
          video_url: string | null
          website_url: string | null
          github_url: string | null
          category: 'devtools' | 'ai' | 'fintech' | 'agtech' | 'edtech' | 'healthtech' | 'ecommerce' | 'social' | 'other' | null
          tags: string[] | null
          upvotes: number
          comment_count: number
          is_trending: boolean
          launch_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          tagline: string
          description?: string | null
          logo_url?: string | null
          image_url?: string | null
          video_url?: string | null
          website_url?: string | null
          github_url?: string | null
          category?: 'devtools' | 'ai' | 'fintech' | 'agtech' | 'edtech' | 'healthtech' | 'ecommerce' | 'social' | 'other' | null
          tags?: string[] | null
          upvotes?: number
          comment_count?: number
          is_trending?: boolean
          launch_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          tagline?: string
          description?: string | null
          logo_url?: string | null
          image_url?: string | null
          video_url?: string | null
          website_url?: string | null
          github_url?: string | null
          category?: 'devtools' | 'ai' | 'fintech' | 'agtech' | 'edtech' | 'healthtech' | 'ecommerce' | 'social' | 'other' | null
          tags?: string[] | null
          upvotes?: number
          comment_count?: number
          is_trending?: boolean
          launch_date?: string | null
          created_at?: string
        }
      }
      feed_items: {
        Row: {
          id: string
          source: string
          external_id: string | null
          title: string
          content: string | null
          url: string | null
          image_url: string | null
          author_name: string | null
          tags: string[] | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          external_id?: string | null
          title: string
          content?: string | null
          url?: string | null
          image_url?: string | null
          author_name?: string | null
          tags?: string[] | null
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          source?: string
          external_id?: string | null
          title?: string
          content?: string | null
          url?: string | null
          image_url?: string | null
          author_name?: string | null
          tags?: string[] | null
          published_at?: string | null
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          launch_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          launch_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          launch_id?: string | null
          created_at?: string
        }
      }
      user_security_keys: {
        Row: {
          id: string
          user_id: string
          credential_id: string
          credential_public_key: string
          counter: number
          device_name: string | null
          transports: string[] | null
          created_at: string
          last_used_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credential_id: string
          credential_public_key: string
          counter?: number
          device_name?: string | null
          transports?: string[] | null
          created_at?: string
          last_used_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credential_id?: string
          credential_public_key?: string
          counter?: number
          device_name?: string | null
          transports?: string[] | null
          created_at?: string
          last_used_at?: string
        }
      }
      bo_conversations: {
        Row: {
          id: string
          user_id: string | null
          messages: Json
          context: string | null
          helpful: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          messages: Json
          context?: string | null
          helpful?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          messages?: Json
          context?: string | null
          helpful?: boolean | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          description: string | null
          icon: string | null
          xp_reward: number
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          description?: string | null
          icon?: string | null
          xp_reward?: number
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          description?: string | null
          icon?: string | null
          xp_reward?: number
          unlocked_at?: string
        }
      }
      upvotes: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          comment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_post_upvotes: {
        Args: {
          post_uuid: string
        }
        Returns: void
      }
      decrement_post_upvotes: {
        Args: {
          post_uuid: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience Types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Entity Types
export type Profile = Tables<'profiles'>
export type Post = Tables<'posts'>
export type Comment = Tables<'comments'>
export type Launch = Tables<'launches'>
export type FeedItem = Tables<'feed_items'>
export type BoConversation = Tables<'bo_conversations'>

// Joined Types (Used in UI)
export type PostWithProfile = Post & {
  profiles: Profile | null
}