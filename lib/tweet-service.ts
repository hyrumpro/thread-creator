import { supabase } from '@/integrations/supabase/client';
import { profileService } from './profile-service';
import type { Tweet as FeedTweet, User as FeedUser } from '@/types/tweet';

export interface Tweet {
  id: string;
  user_id: string;
  content: string;
  images?: string[];
  parent_tweet_id?: string;
  quoted_tweet_id?: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  profiles?: any;
  tweet_stats?: TweetStats;
}

export interface TweetStats {
  tweet_id: string;
  likes_count: number;
  retweets_count: number;
  quotes_count: number;
  comments_count: number;
  views_count: number;
  bookmarks_count: number;
}

export interface CreateTweetData {
  content: string;
  images?: string[];
  parent_tweet_id?: string;
  quoted_tweet_id?: string;
}

export interface TweetWithScore extends Tweet {
  score: number;
  isLiked?: boolean;
  isRetweeted?: boolean;
  isBookmarked?: boolean;
}

type TimelinePageParam =
  | { feed: 'for-you'; offset: number }
  | { feed: 'following'; cursor?: string };

export const tweetService = {
  // Create a new tweet
  async createTweet(data: CreateTweetData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if Pro user for longer tweets
    const profile = await profileService.getCurrentProfile();
    const maxLength = profile.is_pro ? 10000 : 280;

    if (data.content.length > maxLength) {
      throw new Error(`Tweet exceeds maximum length of ${maxLength} characters`);
    }

    const { data: tweet, error } = await supabase
      .from('tweets')
      .insert({
        user_id: user.id,
        content: data.content,
        images: data.images || [],
        parent_tweet_id: data.parent_tweet_id,
        quoted_tweet_id: data.quoted_tweet_id,
      })
      .select(`
        *,
        profiles:user_id(*),
        tweet_stats(*)
      `)
      .single();

    if (error) throw error;
    return tweet as Tweet;
  },

  // Update tweet (Pro users only)
  async updateTweet(tweetId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if Pro user
    const profile = await profileService.getCurrentProfile();
    if (!profile.is_pro) {
      throw new Error('Tweet editing is a Pro feature');
    }

    const { data, error } = await supabase
      .from('tweets')
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', tweetId)
      .eq('user_id', user.id) // Ensure user owns the tweet
      .select(`
        *,
        profiles:user_id(*),
        tweet_stats(*)
      `)
      .single();

    if (error) throw error;
    return data as Tweet;
  },

  // Delete tweet
  async deleteTweet(tweetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('tweets')
      .delete()
      .eq('id', tweetId)
      .eq('user_id', user.id); // Ensure user owns the tweet

    if (error) throw error;
  },

  // Get tweet by ID
  async getTweetById(tweetId: string) {
    const { data, error } = await supabase
      .from('tweets')
      .select(`
        *,
        profiles:user_id(*),
        tweet_stats(*),
        parent_tweet:parent_tweet_id(
          *,
          profiles:user_id(*)
        )
      `)
      .eq('id', tweetId)
      .single();

    if (error) throw error;
    return data as unknown as Tweet;
  },

  // Get user's tweets
  async getUserTweets(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('tweets')
      .select(`
        *,
        profiles:user_id(*),
        tweet_stats(*)
      `)
      .eq('user_id', userId)
      .is('parent_tweet_id', null) // Exclude replies
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Tweet[];
  },

  // Get tweet replies
  async getTweetReplies(tweetId: string) {
    const { data, error } = await supabase
      .from('tweets')
      .select(`
        *,
        profiles:user_id(*),
        tweet_stats(*)
      `)
      .eq('parent_tweet_id', tweetId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Tweet[];
  },

  // Like a tweet
  async likeTweet(tweetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('tweet_interactions')
      .insert({
        user_id: user.id,
        tweet_id: tweetId,
        interaction_type: 'like',
      });

    if (error) throw error;
  },

  // Unlike a tweet
  async unlikeTweet(tweetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('tweet_interactions')
      .delete()
      .eq('user_id', user.id)
      .eq('tweet_id', tweetId)
      .eq('interaction_type', 'like');

    if (error) throw error;
  },

  // Retweet
  async retweetTweet(tweetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('tweet_interactions')
      .insert({
        user_id: user.id,
        tweet_id: tweetId,
        interaction_type: 'retweet',
      });

    if (error) throw error;
  },

  // Unretweet
  async unretweetTweet(tweetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('tweet_interactions')
      .delete()
      .eq('user_id', user.id)
      .eq('tweet_id', tweetId)
      .eq('interaction_type', 'retweet');

    if (error) throw error;
  },

  // Bookmark a tweet
  async bookmarkTweet(tweetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('tweet_interactions')
      .insert({
        user_id: user.id,
        tweet_id: tweetId,
        interaction_type: 'bookmark',
      });

    if (error) throw error;
  },

  // Remove bookmark
  async unbookmarkTweet(tweetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('tweet_interactions')
      .delete()
      .eq('user_id', user.id)
      .eq('tweet_id', tweetId)
      .eq('interaction_type', 'bookmark');

    if (error) throw error;
  },

  // Get user's bookmarks
  async getBookmarks(limit: number = 50, offset: number = 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tweet_interactions')
      .select(`
        tweet_id,
        tweets(
          *,
          profiles:user_id(*),
          tweet_stats(*)
        )
      `)
      .eq('user_id', user.id)
      .eq('interaction_type', 'bookmark')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data.map(item => item.tweets).filter(Boolean) as Tweet[];
  },

  // Check user interactions with tweet
  async getUserInteractions(tweetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isLiked: false, isRetweeted: false, isBookmarked: false };

    const { data, error } = await supabase
      .from('tweet_interactions')
      .select('interaction_type')
      .eq('user_id', user.id)
      .eq('tweet_id', tweetId);

    if (error) return { isLiked: false, isRetweeted: false, isBookmarked: false };

    const interactions = data.map(i => i.interaction_type);
    return {
      isLiked: interactions.includes('like'),
      isRetweeted: interactions.includes('retweet'),
      isBookmarked: interactions.includes('bookmark'),
    };
  },

  // Increment view count
  async incrementViews(tweetId: string) {
    const { error } = await (supabase as any).rpc('increment_tweet_views', {
      tweet_id: tweetId
    });

    if (error) console.error('Error incrementing views:', error);
  },

  async getTimelinePage(params: {
    feed: 'for-you' | 'following';
    limit?: number;
    hoursAgo?: number;
    cursor?: string;
    offset?: number;
  }): Promise<{ items: FeedTweet[]; nextPageParam?: TimelinePageParam }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const limit = params.limit ?? 20;

    if (params.feed === 'for-you') {
      const offset = params.offset ?? 0;
      const hoursAgo = params.hoursAgo ?? 48;

      const { data, error } = await (supabase as any).rpc('get_scored_timeline', {
        p_user_id: user.id,
        p_limit: limit,
        p_hours_ago: hoursAgo,
        p_offset: offset,
      });

      if (error) throw error;

      const tweetIds = (data ?? []).map((row: any) => row.tweet_id);
      const interactions = await this.batchGetUserInteractions(tweetIds, user.id);

      const items = (data ?? []).map((row: any) => transformTimelineRowWithInteractions(row, interactions[row.tweet_id]));
      const nextOffset = items.length === limit ? offset + items.length : undefined;

      return {
        items,
        nextPageParam: nextOffset !== undefined ? { feed: 'for-you', offset: nextOffset } : undefined,
      };
    }

    // Following feed (chronological, cursor-based)
    const { data: followingRows, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    if (followingError) throw followingError;

    const followingIds = (followingRows ?? []).map((row) => row.following_id);
    if (followingIds.length === 0) {
      return { items: [] };
    }

    let query = supabase
      .from('tweets')
      .select(`
        *,
        profiles:user_id(*),
        tweet_stats(*)
      `)
      .in('user_id', followingIds)
      .is('parent_tweet_id', null)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (params.cursor) {
      query = query.lt('created_at', params.cursor);
    }

    const { data, error } = await query;
    if (error) throw error;

    const hasMore = (data?.length ?? 0) > limit;
    const sliced = hasMore ? data!.slice(0, limit) : data ?? [];
    
    const tweetIds = sliced.map((t: any) => t.id);
    const interactions = await this.batchGetUserInteractions(tweetIds, user.id);
    
    const items = sliced.map((row: any) => transformDbTweetWithInteractions(row, interactions[row.id]));
    const nextCursor = hasMore ? sliced[sliced.length - 1].created_at : undefined;

    return {
      items,
      nextPageParam: hasMore && nextCursor
        ? { feed: 'following', cursor: nextCursor }
        : undefined,
    };
  },

  async batchGetUserInteractions(tweetIds: string[], userId: string): Promise<Record<string, { isLiked: boolean; isRetweeted: boolean; isBookmarked: boolean }>> {
    if (tweetIds.length === 0) return {};

    const { data, error } = await supabase
      .from('tweet_interactions')
      .select('tweet_id, interaction_type')
      .eq('user_id', userId)
      .in('tweet_id', tweetIds);

    if (error) {
      console.error('Error fetching interactions:', error);
      return {};
    }

    const result: Record<string, { isLiked: boolean; isRetweeted: boolean; isBookmarked: boolean }> = {};
    
    for (const tweetId of tweetIds) {
      result[tweetId] = { isLiked: false, isRetweeted: false, isBookmarked: false };
    }

    for (const interaction of data ?? []) {
      const tweetId = interaction.tweet_id;
      if (!result[tweetId]) {
        result[tweetId] = { isLiked: false, isRetweeted: false, isBookmarked: false };
      }
      if (interaction.interaction_type === 'like') result[tweetId].isLiked = true;
      if (interaction.interaction_type === 'retweet') result[tweetId].isRetweeted = true;
      if (interaction.interaction_type === 'bookmark') result[tweetId].isBookmarked = true;
    }

    return result;
  },

  // Search tweets by hashtag
  async searchByHashtag(tag: string, limit = 50) {
    const { data, error } = await supabase
      .from('tweets')
      .select(`
        *,
        profiles:user_id(*),
        tweet_stats(*)
      `)
      .ilike('content', `%#${tag}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Tweet[];
  },
};

const HASHTAG_REGEX = /#(\w+)/g;

function extractHashtags(content: string): string[] {
  const matches = content.match(HASHTAG_REGEX);
  return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : [];
}

function fallbackAvatar(username: string) {
  const seed = username || 'user';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function formatJoinedDate(iso?: string) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function transformTimelineRow(row: any): FeedTweet {
  const author: FeedUser = {
    id: row.author_id,
    username: row.author_username,
    displayName: row.author_display_name ?? row.author_username ?? 'Creator',
    avatar: row.author_avatar || fallbackAvatar(row.author_username),
    followers: row.author_followers_count ?? 0,
    following: row.author_following_count ?? 0,
    isVerified: row.author_is_verified ?? false,
    isPro: row.author_is_pro ?? false,
    joinedDate: '—',
    coverImage: undefined,
  };

  return {
    id: row.tweet_id,
    content: row.content,
    author,
    createdAt: new Date(row.created_at),
    likes: row.likes_count ?? 0,
    retweets: row.retweets_count ?? 0,
    comments: row.comments_count ?? 0,
    views: row.views_count ?? 0,
    isLiked: false,
    isRetweeted: false,
    isBookmarked: false,
    hashtags: extractHashtags(row.content),
    images: row.images && row.images.length > 0 ? row.images : undefined,
  };
}

function transformDbTweet(row: any): FeedTweet {
  const profile = row.profiles;
  const author: FeedUser = {
    id: profile?.user_id ?? row.user_id,
    username: profile?.username ?? 'user',
    displayName: profile?.display_name ?? profile?.username ?? 'Creator',
    avatar: profile?.avatar || fallbackAvatar(profile?.username ?? 'user'),
    bio: profile?.bio ?? undefined,
    followers: profile?.followers_count ?? 0,
    following: profile?.following_count ?? 0,
    isVerified: profile?.is_verified ?? false,
    isPro: profile?.is_pro ?? false,
    joinedDate: formatJoinedDate(profile?.created_at),
    coverImage: profile?.cover_image ?? undefined,
  };

  const stats = row.tweet_stats || {};

  return {
    id: row.id,
    content: row.content,
    author,
    createdAt: new Date(row.created_at),
    likes: stats.likes_count ?? 0,
    retweets: stats.retweets_count ?? 0,
    comments: stats.comments_count ?? 0,
    views: stats.views_count ?? 0,
    isLiked: false,
    isRetweeted: false,
    isBookmarked: false,
    hashtags: extractHashtags(row.content),
    images: row.images && row.images.length > 0 ? row.images : undefined,
  };
}

function transformTimelineRowWithInteractions(
  row: any,
  interactions?: { isLiked: boolean; isRetweeted: boolean; isBookmarked: boolean }
): FeedTweet {
  const tweet = transformTimelineRow(row);
  if (interactions) {
    tweet.isLiked = interactions.isLiked;
    tweet.isRetweeted = interactions.isRetweeted;
    tweet.isBookmarked = interactions.isBookmarked;
  }
  return tweet;
}

function transformDbTweetWithInteractions(
  row: any,
  interactions?: { isLiked: boolean; isRetweeted: boolean; isBookmarked: boolean }
): FeedTweet {
  const tweet = transformDbTweet(row);
  if (interactions) {
    tweet.isLiked = interactions.isLiked;
    tweet.isRetweeted = interactions.isRetweeted;
    tweet.isBookmarked = interactions.isBookmarked;
  }
  return tweet;
}
