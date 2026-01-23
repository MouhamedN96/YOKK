// types/community.ts

export interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  joinDate: string;
  bio?: string;
  location?: string;
  skills?: string[];
}

export interface Question {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  upvotes: number;
  downvotes: number;
  views: number;
  answers: number;
  isAnswered: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  category?: string;
}

export interface Answer {
  id: string;
  content: string;
  author: User;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Launch {
  id: string;
  title: string;
  tagline: string;
  description: string;
  author: User;
  logoUrl?: string;
  imageUrl?: string;
  websiteUrl?: string;
  category: string;
  tags: string[];
  upvotes: number;
  comments: number;
  isTrending: boolean;
  launchDate: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  upvotes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  type: 'badge' | 'milestone' | 'special';
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  type: 'question' | 'discussion' | 'article' | 'showcase';
  category?: string;
  tags: string[];
  upvotes: number;
  comments: number;
  views: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  postId: string;
  voteType: 'up' | 'down';
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'answer' | 'upvote' | 'mention' | 'achievement';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  xp: number;
  level: number;
  achievements: number;
}