'use client';

import React, { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { toggleUpvote } from '@/lib/actions/upvote';

interface UpvoteButtonProps {
  postId: string;
  initialUpvotes: number;
  initialUpvoted?: boolean;
  userId?: string;
  onUpvoteChange?: (newCount: number, isUpvoted: boolean) => void;
}

export function UpvoteButton({
  postId,
  initialUpvotes,
  initialUpvoted = false,
  userId,
  onUpvoteChange,
}: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpvote = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!userId) {
        console.warn('User ID is required to upvote');
        return;
      }

      // Optimistic UI update
      setIsLoading(true);
      const previousUpvotes = upvotes;
      const previousIsUpvoted = isUpvoted;

      setIsUpvoted(!isUpvoted);
      setUpvotes(isUpvoted ? upvotes - 1 : upvotes + 1);

      try {
        const result = await toggleUpvote(postId, userId);

        if (result.success) {
          setUpvotes(result.newCount);
          setIsUpvoted(result.isUpvoted);

          // Notify parent component if callback is provided
          if (onUpvoteChange) {
            onUpvoteChange(result.newCount, result.isUpvoted);
          }
        } else {
          // Revert optimistic update if server action fails
          setUpvotes(previousUpvotes);
          setIsUpvoted(previousIsUpvoted);
          console.error('Failed to toggle upvote');
        }
      } catch (error) {
        // Revert optimistic update on error
        setUpvotes(previousUpvotes);
        setIsUpvoted(previousIsUpvoted);
        console.error('Error toggling upvote:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [postId, userId, upvotes, isUpvoted, onUpvoteChange]
  );

  return (
    <button
      onClick={handleUpvote}
      disabled={isLoading || !userId}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
        isUpvoted
          ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400'
      } ${isLoading || !userId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label={isUpvoted ? 'Remove upvote' : 'Upvote'}
      title={!userId ? 'Sign in to upvote' : undefined}
    >
      <Heart
        size={16}
        className={`transition-all duration-200 ${
          isUpvoted ? 'fill-current' : ''
        }`}
      />
      <span className="text-sm font-medium">{upvotes}</span>
    </button>
  );
}
