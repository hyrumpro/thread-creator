'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { TweetCard } from '@/components/tweet/TweetCard';
import { TweetFeed } from '@/components/tweet/TweetFeed';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { tweetService } from '@/lib/tweet-service';
import type { Tweet } from '@/types/tweet';

function fallbackAvatar(username: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username || 'user')}`;
}

function formatJoinedDate(iso?: string) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function dbTweetToFeedTweet(
  row: any,
  interactions: { isLiked: boolean; isRetweeted: boolean; isBookmarked: boolean }
): Tweet {
  const profile = row.profiles;
  return {
    id: row.id,
    content: row.content,
    author: {
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
    },
    createdAt: new Date(row.created_at),
    likes: row.tweet_stats?.likes_count ?? 0,
    retweets: row.tweet_stats?.retweets_count ?? 0,
    comments: row.tweet_stats?.comments_count ?? 0,
    views: row.tweet_stats?.views_count ?? 0,
    isLiked: interactions.isLiked,
    isRetweeted: interactions.isRetweeted,
    isBookmarked: interactions.isBookmarked,
    isEdited: row.is_edited ?? false,
    images: row.images && row.images.length > 0 ? row.images : undefined,
  };
}

async function fetchTweetDetail(tweetId: string) {
  const { data: { user } } = await supabase.auth.getUser();

  const [tweet, replies] = await Promise.all([
    tweetService.getTweetById(tweetId),
    tweetService.getTweetReplies(tweetId),
  ]);

  const allIds = [tweetId, ...(replies as any[]).map((r) => r.id)];
  const interactions = user
    ? await tweetService.batchGetUserInteractions(allIds, user.id)
    : {};

  const none = { isLiked: false, isRetweeted: false, isBookmarked: false };

  return {
    tweet: dbTweetToFeedTweet(tweet, interactions[tweetId] ?? none),
    replies: (replies as any[]).map((r) => dbTweetToFeedTweet(r, interactions[r.id] ?? none)),
  };
}

export default function TweetDetail() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tweetId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['tweet', tweetId],
    queryFn: () => fetchTweetDetail(tweetId),
    enabled: !!tweetId,
    staleTime: 30 * 1000,
  });

  return (
    <MainLayout>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-6 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 -m-2 rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
      </header>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-2xl font-bold mb-2">Post not found</p>
          <p className="text-muted-foreground">This post doesn't exist or was deleted.</p>
        </div>
      )}

      {data && (
        <>
          <div className="border-b border-border">
            <TweetCard tweet={data.tweet} />
          </div>
          <TweetFeed
            tweets={data.replies}
            emptyMessage="No replies yet. Be the first to reply!"
          />
        </>
      )}
    </MainLayout>
  );
}
