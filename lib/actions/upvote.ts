'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function toggleUpvote(postId: string, userId: string) {
  try {
    const supabase = createServerActionClient({ cookies });

    // Check if user has already upvoted this post
    const { data: existingUpvote, error: checkError } = await supabase
      .from('post_upvotes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if no upvote exists
      throw new Error(`Failed to check upvote status: ${checkError.message}`);
    }

    if (existingUpvote) {
      // User has already upvoted, so remove the upvote
      const { error: deleteError } = await supabase
        .from('post_upvotes')
        .delete()
        .eq('id', existingUpvote.id);

      if (deleteError) {
        throw new Error(`Failed to remove upvote: ${deleteError.message}`);
      }

      // Decrement upvotes count in posts table
      const { data: updatedPost, error: updateError } = await supabase
        .from('posts')
        .update({ upvotes: supabase.rpc('decrement_upvotes', { post_id: postId }) })
        .eq('id', postId)
        .select('upvotes')
        .single();

      if (updateError) {
        throw new Error(`Failed to update post upvotes: ${updateError.message}`);
      }

      return {
        success: true,
        newCount: updatedPost?.upvotes ?? 0,
        isUpvoted: false,
      };
    } else {
      // User hasn't upvoted yet, so add an upvote
      const { error: insertError } = await supabase
        .from('post_upvotes')
        .insert({
          post_id: postId,
          user_id: userId,
        });

      if (insertError) {
        throw new Error(`Failed to add upvote: ${insertError.message}`);
      }

      // Increment upvotes count in posts table
      const { data: updatedPost, error: updateError } = await supabase
        .from('posts')
        .update({ upvotes: supabase.rpc('increment_upvotes', { post_id: postId }) })
        .eq('id', postId)
        .select('upvotes')
        .single();

      if (updateError) {
        throw new Error(`Failed to update post upvotes: ${updateError.message}`);
      }

      return {
        success: true,
        newCount: updatedPost?.upvotes ?? 1,
        isUpvoted: true,
      };
    }
  } catch (error) {
    console.error('Upvote toggle error:', error);
    return {
      success: false,
      newCount: 0,
      isUpvoted: false,
    };
  }
}
