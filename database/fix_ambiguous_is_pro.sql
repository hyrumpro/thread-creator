-- Fix: "column reference is_pro is ambiguous" in tweet triggers
-- Fix: "new row violates row-level security policy for table tweet_stats"
-- Run this in Supabase SQL Editor

-- =====================================================
-- FIX 1: Rename local variable to v_is_pro (ambiguity fix)
-- =====================================================

CREATE OR REPLACE FUNCTION check_tweet_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  tweet_count INT;
  v_is_pro BOOLEAN;
BEGIN
  SELECT is_pro INTO v_is_pro FROM profiles WHERE user_id = NEW.user_id;

  SELECT COUNT(*) INTO tweet_count FROM tweets
  WHERE user_id = NEW.user_id AND created_at > NOW() - INTERVAL '1 hour';

  IF v_is_pro THEN
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

CREATE OR REPLACE FUNCTION check_edit_permission()
RETURNS TRIGGER AS $$
DECLARE
  v_is_pro BOOLEAN;
BEGIN
  SELECT is_pro INTO v_is_pro FROM profiles WHERE user_id = NEW.user_id;
  IF NOT v_is_pro THEN
    RAISE EXCEPTION 'Tweet editing is a Pro feature. Upgrade to edit your tweets!';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIX 2: Add SECURITY DEFINER to trigger functions that
-- write to tweet_stats (bypasses RLS which has no INSERT/UPDATE policy)
-- =====================================================

CREATE OR REPLACE FUNCTION create_tweet_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tweet_stats (tweet_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_quotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.quoted_tweet_id IS NOT NULL THEN
    UPDATE tweet_stats SET quotes_count = quotes_count + 1 WHERE tweet_id = NEW.quoted_tweet_id;
  ELSIF TG_OP = 'DELETE' AND OLD.quoted_tweet_id IS NOT NULL THEN
    UPDATE tweet_stats SET quotes_count = GREATEST(quotes_count - 1, 0) WHERE tweet_id = OLD.quoted_tweet_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- FIX 3: Add SECURITY DEFINER to update_follow_counts
-- Without it, the trigger runs as the calling user (follower)
-- and cannot update the other user's followers_count due to RLS.
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
