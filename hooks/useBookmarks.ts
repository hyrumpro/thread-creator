'use client';

import { useQuery } from '@tanstack/react-query';
import { tweetService } from '@/lib/tweet-service';
import { supabase } from '@/integrations/supabase/client';

async function getBookmarksWithInteractions(limit: number = 50, offset: number = 0) {
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

  const tweetIds = data?.map(item => item.tweet_id) ?? [];
  const interactions = await tweetService.batchGetUserInteractions(tweetIds, user.id);

  return data?.map(item => {
    const tweet = item.tweets;
    if (!tweet) return null;
    
    return {
      id: tweet.id,
      content: tweet.content,
      author: {
        id: tweet.profiles?.user_id ?? tweet.user_id,
        username: tweet.profiles?.username ?? 'user',
        displayName: tweet.profiles?.display_name ?? tweet.profiles?.username ?? 'User',
        avatar: tweet.profiles?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (tweet.profiles?.username ?? 'user'),
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
      isBookmarked: true,
      images: tweet.images && tweet.images.length > 0 ? tweet.images : undefined,
    };
  }).filter((t): t is NonNullable<typeof t> => t !== null) ?? [];
}

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => getBookmarksWithInteractions(50, 0),
    staleTime: 60 * 1000,
  });
}
