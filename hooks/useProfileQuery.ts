'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { profileService, Profile } from '@/lib/profile-service';
import { tweetService, Tweet } from '@/lib/tweet-service';
import { supabase } from '@/integrations/supabase/client';

export const profileKeys = {
  all: ['profile'] as const,
  current: () => [...profileKeys.all, 'current'] as const,
  byUsername: (username: string) => [...profileKeys.all, 'username', username] as const,
  tweets: (userId: string) => ['tweets', 'user', userId] as const,
};

async function fetchCurrentProfile(): Promise<Profile | null> {
  try {
    return await profileService.getCurrentProfile();
  } catch (error: any) {
    const message = error?.message ?? '';
    if (typeof message === 'string' && message.includes('Not authenticated')) {
      return null;
    }
    throw error;
  }
}

export function useCurrentProfile() {
  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: fetchCurrentProfile,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useProfileByUsername(username: string | undefined) {
  return useQuery({
    queryKey: profileKeys.byUsername(username || ''),
    queryFn: () => username ? profileService.getProfileByUsername(username) : null,
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

interface UserTweetsPage {
  items: any[];
  nextCursor?: string;
}

async function fetchUserTweetsPage(
  userId: string, 
  cursor?: string, 
  limit: number = 20
): Promise<UserTweetsPage> {
  const { data: { user } } = await supabase.auth.getUser();
  
  let query = supabase
    .from('tweets')
    .select(`
      *,
      profiles:user_id(*),
      tweet_stats(*)
    `)
    .eq('user_id', userId)
    .is('parent_tweet_id', null)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw error;

  if (!data || data.length === 0) {
    return { items: [] };
  }

  const hasMore = data.length > limit;
  const sliced = hasMore ? data.slice(0, limit) : data;

  const tweetIds = sliced.map(t => t.id);
  const interactions = user 
    ? await tweetService.batchGetUserInteractions(tweetIds, user.id) 
    : {};

  const items = sliced.map(tweet => ({
    id: tweet.id,
    content: tweet.content,
    author: {
      id: tweet.profiles?.user_id ?? tweet.user_id,
      username: tweet.profiles?.username ?? 'user',
      displayName: tweet.profiles?.display_name ?? tweet.profiles?.username ?? 'Creator',
      avatar: tweet.profiles?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tweet.profiles?.username ?? 'user'}`,
      bio: tweet.profiles?.bio ?? undefined,
      followers: tweet.profiles?.followers_count ?? 0,
      following: tweet.profiles?.following_count ?? 0,
      isVerified: tweet.profiles?.is_verified ?? false,
      isPro: tweet.profiles?.is_pro ?? false,
      joinedDate: tweet.profiles?.created_at ? new Date(tweet.profiles.created_at).toLocaleString("en-US", { month: "long", year: "numeric" }) : '—',
      coverImage: tweet.profiles?.cover_image ?? undefined,
    },
    createdAt: new Date(tweet.created_at),
    likes: tweet.tweet_stats?.likes_count ?? 0,
    retweets: tweet.tweet_stats?.retweets_count ?? 0,
    comments: tweet.tweet_stats?.comments_count ?? 0,
    views: tweet.tweet_stats?.views_count ?? 0,
    isLiked: interactions[tweet.id]?.isLiked ?? false,
    isRetweeted: interactions[tweet.id]?.isRetweeted ?? false,
    isBookmarked: interactions[tweet.id]?.isBookmarked ?? false,
    isEdited: tweet.is_edited ?? false,
    images: tweet.images && tweet.images.length > 0 ? tweet.images : undefined,
  }));

  const nextCursor = hasMore ? sliced[sliced.length - 1].created_at : undefined;

  return { items, nextCursor };
}

export function useUserTweets(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: profileKeys.tweets(userId || ''),
    queryFn: ({ pageParam }) => 
      userId ? fetchUserTweetsPage(userId, pageParam, 20) : Promise.resolve({ items: [], nextCursor: undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: UserTweetsPage) => lastPage.nextCursor,
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useUserFollowStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ['follow', userId],
    queryFn: () => userId ? profileService.isFollowing(userId) : false,
    enabled: !!userId,
  });
}
