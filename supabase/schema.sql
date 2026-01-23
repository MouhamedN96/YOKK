-- YOKK: AI-Native Developer Community for Africa
-- Supabase Schema - Community Focused

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_posts INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  helpful_comments INTEGER DEFAULT 0,
  total_launches INTEGER DEFAULT 0,
  preferred_languages TEXT[],
  interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POSTS
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'discussion' CHECK (type IN ('question', 'tutorial', 'discussion', 'showcase')),
  category TEXT,
  tags TEXT[],
  image_url TEXT,
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMMENTS
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  is_helpful BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPVOTES
CREATE TABLE upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- LAUNCHES
CREATE TABLE launches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  image_url TEXT,
  video_url TEXT,
  website_url TEXT,
  github_url TEXT,
  category TEXT CHECK (category IN ('devtools','ai','fintech','agtech','edtech','healthtech','ecommerce','social','other')),
  tags TEXT[],
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  launch_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACHIEVEMENTS
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- BO CONVERSATIONS
CREATE TABLE bo_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL,
  context TEXT,
  helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FEED ITEMS
CREATE TABLE feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  external_id TEXT,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  image_url TEXT,
  author_name TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, external_id)
);

-- BOOKMARKS
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  launch_id UUID REFERENCES launches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSKEYS (WebAuthn)
CREATE TABLE user_security_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL,
  credential_public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  device_name TEXT,
  transports TEXT[], 
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, credential_id)
);

-- INDEXES
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_launches_author ON launches(author_id);
CREATE INDEX idx_launches_trending ON launches(is_trending);
CREATE INDEX idx_feed_items_source ON feed_items(source);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_security_keys_user ON user_security_keys(user_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bo_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_keys ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Author posts" ON posts FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Public comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Author comments" ON comments FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Public upvotes" ON upvotes FOR SELECT USING (true);
CREATE POLICY "Own upvotes" ON upvotes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public launches" ON launches FOR SELECT USING (true);
CREATE POLICY "Author launches" ON launches FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Public achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Own bo_conversations" ON bo_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public feed" ON feed_items FOR SELECT USING (true);
CREATE POLICY "Own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own security keys" ON user_security_keys FOR ALL USING (auth.uid() = user_id);


-- RPC FUNCTIONS
CREATE OR REPLACE FUNCTION increment_post_upvotes(post_uuid UUID) RETURNS void AS $$
BEGIN UPDATE posts SET upvotes = upvotes + 1 WHERE id = post_uuid; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_upvotes(post_uuid UUID) RETURNS void AS $$
BEGIN UPDATE posts SET upvotes = GREATEST(0, upvotes - 1) WHERE id = post_uuid; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
