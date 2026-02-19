'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { tweetService } from '@/lib/tweet-service';
import type { Tweet, User } from '@/types/tweet';

interface HashtagPage {
  items: Tweet[];
  nextCursor?: string;
}

async function fetchTweetsByHashtag(tag: string, cursor?: string, limit: number = 20): Promise<HashtagPage> {
  let query = supabase
    .from('tweets')
    .select(`
      id,
      content,
      created_at,
      images,
      is_edited,
      user_id,
      profiles:user_id(
        user_id,
        username,
        display_name,
        avatar,
        is_verified,
        is_pro,
        followers_count,
        following_count,
        created_at,
        bio,
        cover_image
      ),
      tweet_stats(
        likes_count,
        retweets_count,
        comments_count,
        views_count,
        bookmarks_count
      )
    `)
    .ilike('content', `%#${tag}%`)
    .is('parent_tweet_id', null)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw error;
  if (!data) return { items: [] };

  const hasMore = data.length > limit;
  const sliced = hasMore ? data.slice(0, limit) : data;

  const { data: { user } } = await supabase.auth.getUser();

  const tweetIds = sliced.map(t => t.id);
  const interactions = user ? await tweetService.batchGetUserInteractions(tweetIds, user.id) : {};

  const items = sliced.map((tweet: any) => {
    const profile = tweet.profiles || {};
    const stats = tweet.tweet_stats || {};
    
    const author: User = {
      id: profile.user_id || tweet.user_id,
      username: profile.username || 'user',
      displayName: profile.display_name || profile.username || 'User',
      avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'user'}`,
      bio: profile.bio,
      followers: profile.followers_count || 0,
      following: profile.following_count || 0,
      isVerified: profile.is_verified || false,
      isPro: profile.is_pro || false,
      joinedDate: profile.created_at 
        ? new Date(profile.created_at).toLocaleString('en-US', { month: 'long', year: 'numeric' })
        : '—',
      coverImage: profile.cover_image,
    };

    const hashtags = tweet.content?.match(/#\w+/g)?.map((t: string) => t.slice(1)) || [];

    return {
      id: tweet.id,
      content: tweet.content,
      author,
      createdAt: new Date(tweet.created_at),
      likes: stats.likes_count || 0,
      retweets: stats.retweets_count || 0,
      comments: stats.comments_count || 0,
      views: stats.views_count || 0,
      isLiked: interactions[tweet.id]?.isLiked ?? false,
      isRetweeted: interactions[tweet.id]?.isRetweeted ?? false,
      isBookmarked: interactions[tweet.id]?.isBookmarked ?? false,
      isEdited: tweet.is_edited || false,
      images: tweet.images || [],
      hashtags,
    };
  });

  const nextCursor = hasMore ? sliced[sliced.length - 1].created_at : undefined;

  return { items, nextCursor };
}

export function useHashtagTweets(tag: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['hashtag', tag],
    queryFn: ({ pageParam }) => fetchTweetsByHashtag(tag!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!tag,
    staleTime: 60 * 1000,
  });
}
