-- Thread Creator Database Schema
-- Production-ready schema with proper security and performance

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE subscription_plan AS ENUM ('free', 'pro');
CREATE TYPE subscription_status AS ENUM ('inactive', 'active', 'past_due', 'canceled');
CREATE TYPE interaction_type AS ENUM ('like', 'retweet', 'bookmark');
CREATE TYPE notification_type AS ENUM ('like', 'retweet', 'comment', 'follow', 'mention', 'quote');
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar TEXT,
  cover_image TEXT,
  location TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_pro BOOLEAN DEFAULT false,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  tweets_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 15),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'inactive',
  provider TEXT,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (
    current_period_end IS NULL
    OR current_period_start IS NULL
    OR current_period_end > current_period_start
  )
);

CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_customer ON subscriptions(provider_customer_id);

-- =====================================================
-- TWEETS TABLE
-- =====================================================
CREATE TABLE tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 10000),
  images TEXT[],
  parent_tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
  quoted_tweet_id UUID REFERENCES tweets(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tweets_user_id ON tweets(user_id);
CREATE INDEX idx_tweets_parent_tweet_id ON tweets(parent_tweet_id);
CREATE INDEX idx_tweets_created_at ON tweets(created_at DESC);
CREATE INDEX idx_tweets_no_parent ON tweets(created_at DESC) WHERE parent_tweet_id IS NULL;
CREATE INDEX idx_tweets_user_created ON tweets(user_id, created_at DESC) WHERE parent_tweet_id IS NULL;

-- =====================================================
-- TWEET STATS TABLE
-- =====================================================
CREATE TABLE tweet_stats (
  tweet_id UUID PRIMARY KEY REFERENCES tweets(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  retweets_count INTEGER DEFAULT 0,
  quotes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TWEET INTERACTIONS TABLE
-- =====================================================
CREATE TABLE tweet_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  tweet_id UUID NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, tweet_id, interaction_type)
);

CREATE INDEX idx_tweet_interactions_user_id ON tweet_interactions(user_id);
CREATE INDEX idx_tweet_interactions_tweet_id ON tweet_interactions(tweet_id);
CREATE INDEX idx_tweet_interactions_user_tweet ON tweet_interactions(user_id, tweet_id, interaction_type);
CREATE INDEX idx_tweet_interactions_bookmarks ON tweet_interactions(user_id, interaction_type, created_at DESC) WHERE interaction_type = 'bookmark';

-- =====================================================
-- FOLLOWS TABLE
-- =====================================================
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- =====================================================
-- HASHTAGS TABLE
-- =====================================================
CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag TEXT UNIQUE NOT NULL,
  tweet_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hashtags_tag ON hashtags(tag);
CREATE INDEX idx_hashtags_tweet_count ON hashtags(tweet_count DESC);

-- =====================================================
-- TWEET HASHTAGS TABLE
-- =====================================================
CREATE TABLE tweet_hashtags (
  tweet_id UUID NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (tweet_id, hashtag_id)
);

CREATE INDEX idx_tweet_hashtags_hashtag ON tweet_hashtags(hashtag_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (user_id != actor_id)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- USER ROLES TABLE
-- =====================================================
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  role user_role DEFAULT 'user',
  granted_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS - Updated At
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tweets_updated_at BEFORE UPDATE ON tweets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TRIGGERS - Tweet Stats
-- =====================================================
CREATE OR REPLACE FUNCTION create_tweet_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tweet_stats (tweet_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_tweet_stats_trigger AFTER INSERT ON tweets
  FOR EACH ROW EXECUTE FUNCTION create_tweet_stats();

-- =====================================================
-- TRIGGERS - Interaction Counts
-- =====================================================
CREATE OR REPLACE FUNCTION update_tweet_interaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'like' THEN
      UPDATE tweet_stats SET likes_count = likes_count + 1 WHERE tweet_id = NEW.tweet_id;
    ELSIF NEW.interaction_type = 'retweet' THEN
      UPDATE tweet_stats SET retweets_count = retweets_count + 1 WHERE tweet_id = NEW.tweet_id;
    ELSIF NEW.interaction_type = 'bookmark' THEN
      UPDATE tweet_stats SET bookmarks_count = bookmarks_count + 1 WHERE tweet_id = NEW.tweet_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'like' THEN
      UPDATE tweet_stats SET likes_count = GREATEST(likes_count - 1, 0) WHERE tweet_id = OLD.tweet_id;
    ELSIF OLD.interaction_type = 'retweet' THEN
      UPDATE tweet_stats SET retweets_count = GREATEST(retweets_count - 1, 0) WHERE tweet_id = OLD.tweet_id;
    ELSIF OLD.interaction_type = 'bookmark' THEN
      UPDATE tweet_stats SET bookmarks_count = GREATEST(bookmarks_count - 1, 0) WHERE tweet_id = OLD.tweet_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tweet_interaction_count_trigger
  AFTER INSERT OR DELETE ON tweet_interactions
  FOR EACH ROW EXECUTE FUNCTION update_tweet_interaction_count();

-- =====================================================
-- TRIGGERS - Comments Count
-- =====================================================
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_tweet_id IS NOT NULL THEN
    UPDATE tweet_stats SET comments_count = comments_count + 1 WHERE tweet_id = NEW.parent_tweet_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_tweet_id IS NOT NULL THEN
    UPDATE tweet_stats SET comments_count = GREATEST(comments_count - 1, 0) WHERE tweet_id = OLD.parent_tweet_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_count_trigger
  AFTER INSERT OR DELETE ON tweets
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- =====================================================
-- TRIGGERS - Follow Counts
-- =====================================================
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
    UPDATE profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE user_id = OLD.follower_id;
    UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE user_id = OLD.following_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- =====================================================
-- TRIGGERS - Profile Tweets Count
-- =====================================================
CREATE OR REPLACE FUNCTION update_profile_tweets_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_tweet_id IS NULL THEN
    UPDATE profiles SET tweets_count = tweets_count + 1 WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_tweet_id IS NULL THEN
    UPDATE profiles SET tweets_count = GREATEST(tweets_count - 1, 0) WHERE user_id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_tweets_count_trigger
  AFTER INSERT OR DELETE ON tweets
  FOR EACH ROW EXECUTE FUNCTION update_profile_tweets_count();

-- =====================================================
-- TRIGGERS - Auto Create Profile on Signup
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name, email, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- TRIGGERS - Sync Subscription to Profile
-- =====================================================
CREATE OR REPLACE FUNCTION sync_profile_with_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE profiles SET is_pro = false WHERE user_id = OLD.user_id AND is_pro IS DISTINCT FROM false;
    RETURN OLD;
  ELSE
    IF NEW.status = 'active' OR NEW.status = 'trialing' THEN
      UPDATE profiles SET is_pro = true WHERE user_id = NEW.user_id AND is_pro IS DISTINCT FROM true;
    ELSIF NEW.status = 'canceled' OR NEW.status = 'unpaid' THEN
      UPDATE profiles SET is_pro = false WHERE user_id = NEW.user_id AND is_pro IS DISTINCT FROM false;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER sync_profile_on_subscription_change
  AFTER INSERT OR UPDATE OF status ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION sync_profile_with_subscription();

CREATE TRIGGER sync_profile_on_subscription_delete
  AFTER DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION sync_profile_with_subscription();

-- =====================================================
-- TRIGGERS - Auto Verify Pro Users
-- =====================================================
CREATE OR REPLACE FUNCTION auto_verify_pro_users()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_pro = true AND (OLD.is_pro = false OR OLD.is_pro IS NULL) THEN
    NEW.is_verified := true;
  ELSIF NEW.is_pro = false AND OLD.is_pro = true THEN
    NEW.is_verified := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_verify_on_pro_upgrade
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.is_pro IS DISTINCT FROM NEW.is_pro)
  EXECUTE FUNCTION auto_verify_pro_users();

-- =====================================================
-- FUNCTIONS - Rate Limiting
-- =====================================================
CREATE OR REPLACE FUNCTION check_tweet_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  tweet_count INT;
  is_pro BOOLEAN;
BEGIN
  SELECT is_pro INTO is_pro FROM profiles WHERE user_id = NEW.user_id;
  
  SELECT COUNT(*) INTO tweet_count FROM tweets
  WHERE user_id = NEW.user_id AND created_at > NOW() - INTERVAL '1 hour';

  IF is_pro THEN
    IF tweet_count >= 100 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Pro users can post 100 tweets per hour.';
    END IF;
  ELSE
    IF tweet_count >= 20 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Free users can post 20 tweets per hour. Upgrade to Pro for more!';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_tweet_rate_limit
  BEFORE INSERT ON tweets
  FOR EACH ROW EXECUTE FUNCTION check_tweet_rate_limit();

-- =====================================================
-- FUNCTIONS - Tweet Length Enforcement
-- =====================================================
CREATE OR REPLACE FUNCTION enforce_tweet_length_limit()
RETURNS TRIGGER AS $$
DECLARE
  author_is_pro BOOLEAN;
  max_len INT;
BEGIN
  SELECT is_pro INTO author_is_pro FROM profiles WHERE user_id = NEW.user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  max_len := CASE WHEN author_is_pro THEN 10000 ELSE 280 END;

  IF char_length(NEW.content) > max_len THEN
    IF author_is_pro THEN
      RAISE EXCEPTION 'Pro tweets are limited to 10000 characters.';
    ELSE
      RAISE EXCEPTION 'Free tweets are limited to 280 characters. Upgrade to Pro for longer posts!';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_tweet_length_limit
  BEFORE INSERT OR UPDATE OF content ON tweets
  FOR EACH ROW EXECUTE FUNCTION enforce_tweet_length_limit();

-- =====================================================
-- FUNCTIONS - Edit Permission
-- =====================================================
CREATE OR REPLACE FUNCTION check_edit_permission()
RETURNS TRIGGER AS $$
DECLARE
  is_pro BOOLEAN;
BEGIN
  SELECT is_pro INTO is_pro FROM profiles WHERE user_id = NEW.user_id;
  IF NOT is_pro THEN
    RAISE EXCEPTION 'Tweet editing is a Pro feature. Upgrade to edit your tweets!';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_edit_permission
  BEFORE UPDATE ON tweets
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content)
  EXECUTE FUNCTION check_edit_permission();

-- =====================================================
-- FUNCTIONS - Increment Views
-- =====================================================
CREATE OR REPLACE FUNCTION increment_tweet_views(p_tweet_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE tweet_stats SET views_count = views_count + 1, updated_at = NOW()
  WHERE tweet_id = p_tweet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- FUNCTIONS - Hashtag Extraction
-- =====================================================
CREATE OR REPLACE FUNCTION extract_hashtags_from_tweet()
RETURNS TRIGGER AS $$
DECLARE
  hashtag_text TEXT;
  hashtag_lower TEXT;
BEGIN
  DELETE FROM tweet_hashtags WHERE tweet_id = NEW.id;
  
  FOR hashtag_text IN SELECT regexp_matches(NEW.content, '#[a-zA-Z0-9_]+', 'g')
  LOOP
    hashtag_lower := lower(substring(hashtag_text, 2));
    CONTINUE WHEN hashtag_lower = '';
    
    INSERT INTO hashtags (tag, tweet_count)
    VALUES (hashtag_lower, 1)
    ON CONFLICT (tag) DO UPDATE SET 
      tweet_count = hashtags.tweet_count + 1,
      updated_at = NOW();
    
    INSERT INTO tweet_hashtags (tweet_id, hashtag_id)
    VALUES (NEW.id, (SELECT id FROM hashtags WHERE tag = hashtag_lower))
    ON CONFLICT DO NOTHING;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_tweet_created_extract_hashtags
  AFTER INSERT OR UPDATE ON tweets
  FOR EACH ROW EXECUTE FUNCTION extract_hashtags_from_tweet();

CREATE OR REPLACE FUNCTION update_hashtag_counts()
RETURNS TRIGGER AS $$
DECLARE
  h_id UUID;
BEGIN
  FOR h_id IN SELECT hashtag_id FROM tweet_hashtags WHERE tweet_id = OLD.id
  LOOP
    UPDATE hashtags SET tweet_count = GREATEST(0, tweet_count - 1), updated_at = NOW() WHERE id = h_id;
    DELETE FROM hashtags WHERE id = h_id AND tweet_count <= 0;
  END LOOP;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_tweet_deleted_update_hashtags
  BEFORE DELETE ON tweets
  FOR EACH ROW EXECUTE FUNCTION update_hashtag_counts();

-- =====================================================
-- FUNCTIONS - Timeline Algorithm
-- =====================================================
CREATE OR REPLACE FUNCTION get_scored_timeline(
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_hours_ago INT DEFAULT 48,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  tweet_id UUID,
  content TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ,
  score NUMERIC,
  likes_count INT,
  retweets_count INT,
  comments_count INT,
  views_count INT,
  bookmarks_count INT,
  author_id UUID,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar TEXT,
  author_is_verified BOOLEAN,
  author_is_pro BOOLEAN,
  author_followers_count INT,
  author_following_count INT
) AS $$
DECLARE
  following_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(following_id) INTO following_ids
  FROM follows WHERE follower_id = p_user_id;

  RETURN QUERY
  SELECT
    t.id,
    t.content,
    t.images,
    t.created_at,
    (
      (COALESCE(ts.likes_count, 0) * 1.5) +
      (COALESCE(ts.retweets_count, 0) * 2) +
      (COALESCE(ts.comments_count, 0)) +
      CASE WHEN t.user_id = ANY(following_ids) THEN 5 ELSE 0 END +
      CASE WHEN p.is_pro THEN 2 ELSE 0 END +
      CASE WHEN p.is_verified THEN 1 ELSE 0 END -
      (EXTRACT(EPOCH FROM (NOW() - t.created_at)) / 3600 * 0.5)
    )::NUMERIC,
    COALESCE(ts.likes_count, 0),
    COALESCE(ts.retweets_count, 0),
    COALESCE(ts.comments_count, 0),
    COALESCE(ts.views_count, 0),
    COALESCE(ts.bookmarks_count, 0),
    p.user_id,
    p.username,
    p.display_name,
    p.avatar,
    p.is_verified,
    p.is_pro,
    p.followers_count,
    p.following_count
  FROM tweets t
  LEFT JOIN tweet_stats ts ON t.id = ts.tweet_id
  LEFT JOIN profiles p ON t.user_id = p.user_id
  WHERE t.created_at > (NOW() - (p_hours_ago || ' hours')::INTERVAL)
    AND t.parent_tweet_id IS NULL
  ORDER BY score DESC, t.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies (using (SELECT auth.uid()) for performance)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Tweets policies
CREATE POLICY "tweets_select" ON tweets FOR SELECT USING (true);
CREATE POLICY "tweets_insert" ON tweets FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "tweets_update" ON tweets FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "tweets_delete" ON tweets FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Tweet stats policies
CREATE POLICY "tweet_stats_select" ON tweet_stats FOR SELECT USING (true);

-- Tweet interactions policies
CREATE POLICY "tweet_interactions_select" ON tweet_interactions FOR SELECT USING (true);
CREATE POLICY "tweet_interactions_insert" ON tweet_interactions FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "tweet_interactions_delete" ON tweet_interactions FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Follows policies
CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK ((SELECT auth.uid()) = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING ((SELECT auth.uid()) = follower_id);

-- Hashtags policies
CREATE POLICY "hashtags_select" ON hashtags FOR SELECT USING (true);

-- Tweet hashtags policies
CREATE POLICY "tweet_hashtags_select" ON tweet_hashtags FOR SELECT USING (true);

-- Notifications policies
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK ((SELECT auth.uid()) = actor_id);

-- User roles policies
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT USING (true);

-- Subscriptions policies
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "subscriptions_update" ON subscriptions FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION increment_tweet_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_scored_timeline(UUID, INT, INT, INT) TO authenticated;
