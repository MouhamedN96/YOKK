import { column, Schema, Table } from '@powersync/web';

// Profiles table - user information and gamification
const profiles = new Table({
  username: column.text,
  email: column.text,
  full_name: column.text,
  avatar_url: column.text,
  bio: column.text,
  level: column.integer,
  xp: column.integer,
  streak_days: column.integer,
  last_activity_date: column.text,
  total_posts: column.integer,
  total_comments: column.integer,
});

// Posts table - community discussions, questions, and articles
const posts = new Table({
  author_id: column.text,
  title: column.text,
  content: column.text,
  type: column.text, // 'question', 'discussion', 'article', 'showcase'
  category: column.text,
  tags: column.text, // JSON array stored as text
  image_url: column.text,
  upvotes: column.integer,
  comment_count: column.integer,
  view_count: column.integer,
  is_answered: column.integer, // boolean (0/1)
  is_featured: column.integer, // boolean (0/1)
});

// Comments table - nested comments on posts
const comments = new Table({
  post_id: column.text,
  author_id: column.text,
  parent_comment_id: column.text, // for nested comments
  content: column.text,
  upvotes: column.integer,
  is_accepted: column.integer, // boolean (0/1) - accepted answer
  is_helpful: column.integer, // boolean (0/1) - marked as helpful
});

// Upvotes table - tracks all upvotes for posts and comments
const upvotes = new Table({
  user_id: column.text,
  post_id: column.text, // nullable - upvote on post
  comment_id: column.text, // nullable - upvote on comment
});

// Launches table - product launches and showcases
const launches = new Table({
  author_id: column.text,
  title: column.text,
  tagline: column.text,
  description: column.text,
  logo_url: column.text,
  image_url: column.text,
  website_url: column.text,
  category: column.text,
  tags: column.text, // JSON array stored as text
  upvotes: column.integer,
  comment_count: column.integer,
  is_trending: column.integer, // boolean (0/1)
  launch_date: column.text,
});

// Achievements table - user achievements and badges
const achievements = new Table({
  user_id: column.text,
  type: column.text, // 'badge', 'milestone', 'special'
  title: column.text,
  description: column.text,
  icon: column.text,
  xp_reward: column.integer,
  unlocked_at: column.text,
});

// Feed items table - aggregated external content (Dev.to, HN, GitHub trending)
const feed_items = new Table({
  source: column.text, // 'devto', 'hackernews', 'github'
  external_id: column.text,
  title: column.text,
  content: column.text,
  url: column.text,
  image_url: column.text,
  author_name: column.text,
  tags: column.text, // JSON array stored as text
  published_at: column.text,
});

// Bookmarks table - saved posts and launches
const bookmarks = new Table({
  user_id: column.text,
  post_id: column.text, // nullable
  launch_id: column.text, // nullable
});

// Export the complete schema
export const AppSchema = new Schema({
  profiles,
  posts,
  comments,
  upvotes,
  launches,
  achievements,
  feed_items,
  bookmarks,
});

// Export database type for type-safe queries
export type Database = (typeof AppSchema)['types'];
