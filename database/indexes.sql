-- Additional indexes for better query performance
-- Run this after the main schema.sql

-- Add composite index for hashtag content search
CREATE INDEX IF NOT EXISTS idx_tweets_content_hashtags ON tweets USING gin(to_tsvector('simple', content));

-- Add index for profile search by username or display name
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON profiles(lower(username));
CREATE INDEX IF NOT EXISTS idx_profiles_display_name_lower ON profiles(lower(display_name));

-- Add index for faster hashtag pagination
CREATE INDEX IF NOT EXISTS idx_tweets_hashtag_search ON tweets(created_at DESC) 
  WHERE parent_tweet_id IS NULL;

-- Function for efficient hashtag tweet count
CREATE OR REPLACE FUNCTION get_hashtag_tweet_count(p_tag TEXT)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT tweet_count INTO count FROM hashtags WHERE tag = lower(p_tag);
  RETURN COALESCE(count, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Function to get suggested users (not followed, ordered by followers)
CREATE OR REPLACE FUNCTION get_suggested_users(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar TEXT,
  is_verified BOOLEAN,
  is_pro BOOLEAN,
  followers_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.username,
    p.display_name,
    p.avatar,
    p.is_verified,
    p.is_pro,
    p.followers_count
  FROM profiles p
  WHERE p.user_id != p_user_id
    AND p.user_id NOT IN (
      SELECT f.following_id FROM follows f WHERE f.follower_id = p_user_id
    )
  ORDER BY p.followers_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_hashtag_tweet_count(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_suggested_users(UUID, INTEGER) TO authenticated;
