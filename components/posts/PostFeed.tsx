'use client';

import React from 'react';
import { PostCard } from '@/components/feed/PostCard';
import type { PostWithProfile } from '@/lib/supabase/types';

interface PostFeedProps {
  posts: PostWithProfile[];
  onUpvote?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

export function PostFeed({ posts, onUpvote, onBookmark }: PostFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-xl border border-white/10">
        <p className="text-clay-white/60">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onUpvote={onUpvote}
          onBookmark={onBookmark}
        />
      ))}
    </div>
  );
}
