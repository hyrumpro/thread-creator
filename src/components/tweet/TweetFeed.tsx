import { useState, useCallback } from "react";
import { Tweet } from "@/types/tweet";
import { TweetCard } from "./TweetCard";
import { InfiniteScroll, TweetSkeleton } from "@/components/ui/infinite-scroll";

interface TweetFeedProps {
  tweets: Tweet[];
  emptyMessage?: string;
  pageSize?: number;
}

export function TweetFeed({ 
  tweets, 
  emptyMessage = "No posts yet",
  pageSize = 10
}: TweetFeedProps) {
  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);

  const displayedTweets = tweets.slice(0, displayedCount);
  const hasMore = displayedCount < tweets.length;

  const handleLoadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Simulate API delay for smooth UX
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + pageSize, tweets.length));
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, pageSize, tweets.length]);

  if (tweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <p className="text-2xl font-bold mb-2">Nothing to see here — yet</p>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      loader={
        <div className="divide-y divide-border">
          <TweetSkeleton />
          <TweetSkeleton />
        </div>
      }
      endMessage={
        tweets.length > pageSize && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground text-sm">You've reached the end</p>
          </div>
        )
      }
    >
      <div className="divide-y divide-border">
        {displayedTweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </div>
    </InfiniteScroll>
  );
}
