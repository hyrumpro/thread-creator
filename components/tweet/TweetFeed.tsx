'use client';

import { Tweet } from "@/types/tweet";
import { TweetCard } from "./TweetCard";
import { InfiniteScroll, TweetSkeleton } from "@/components/ui/infinite-scroll";

interface TweetFeedProps {
  tweets: Tweet[];
  emptyMessage?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  isInitialLoading?: boolean;
}

export function TweetFeed({
  tweets,
  emptyMessage = "No posts yet",
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
  isInitialLoading = false,
}: TweetFeedProps) {
  if (isInitialLoading && tweets.length === 0) {
    return (
      <div className="divide-y divide-border">
        <TweetSkeleton />
        <TweetSkeleton />
        <TweetSkeleton />
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <p className="text-2xl font-bold mb-2">Nothing to see here - yet</p>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const content = (
    <div className="divide-y divide-border">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );

  if (!onLoadMore) {
    return content;
  }

  return (
    <InfiniteScroll
      onLoadMore={onLoadMore}
      hasMore={Boolean(hasMore)}
      isLoading={isFetchingMore}
      loader={
        <div className="divide-y divide-border">
          <TweetSkeleton />
          <TweetSkeleton />
        </div>
      }
      endMessage={
        !hasMore && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground text-sm">You've reached the end</p>
          </div>
        )
      }
    >
      {content}
    </InfiniteScroll>
  );
}
