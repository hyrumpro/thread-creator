'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { tweetService } from '@/lib/tweet-service';
import type { Tweet } from '@/types/tweet';

interface TimelinePage {
  items: Tweet[];
  nextPageParam?: { feed: 'for-you' | 'following'; offset?: number; cursor?: string };
}

type PageParam = { feed: 'for-you' | 'following'; offset?: number; cursor?: string };

export function useTimeline(feed: 'for-you' | 'following') {
  return useInfiniteQuery({
    queryKey: ['timeline', feed],
    queryFn: ({ pageParam }: { pageParam: PageParam | undefined }) => {
      if (pageParam && pageParam.feed !== feed) {
        return tweetService.getTimelinePage({ feed });
      }

      return tweetService.getTimelinePage({
        feed,
        offset: pageParam?.offset,
        cursor: pageParam?.cursor,
      });
    },
    initialPageParam: feed === 'for-you'
      ? { feed: 'for-you', offset: 0 }
      : { feed: 'following' as const },
    getNextPageParam: (lastPage: TimelinePage) => lastPage.nextPageParam,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });
}
