import { Tweet } from "@/types/tweet";
import { TweetCard } from "./TweetCard";

interface TweetFeedProps {
  tweets: Tweet[];
  emptyMessage?: string;
}

export function TweetFeed({ tweets, emptyMessage = "No posts yet" }: TweetFeedProps) {
  if (tweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <p className="text-2xl font-bold mb-2">Nothing to see here — yet</p>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
}
